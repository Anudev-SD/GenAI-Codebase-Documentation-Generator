"""
GenDocuAgent CLI - Built with Typer and Pydantic v2.
Scans local Generative AI codebases and auto-generates portfolio-ready README.md,
ARCHITECTURE.md, and validated Mermaid.js diagrams.
"""

import sys
import os
from pathlib import Path
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax
from rich.progress import Progress, SpinnerColumn, TextColumn

from docugen.ingestion import scan_codebase
from docugen.pipeline import DocuGenPipeline
from docugen.agents.mermaid_validator import MermaidValidatorAgent
from docugen.agents.eval_extractor import EvalExtractorAgent

app = typer.Typer(
    name="docugen",
    help="🤖 Auto-generate portfolio-ready READMEs, ARCHITECTURE docs, and Mermaid diagrams for GenAI codebases.",
    add_completion=False,
)
console = Console()


@app.command()
def scan(
    path: str = typer.Argument(".", help="Path to local codebase repository"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show deep AST function calls and prompts"),
):
    """
    Deterministic AST scan: Extracts system prompts, framework imports, and bloat stats.
    """
    console.print(Panel.fit("[bold cyan]GenDocuAgent[/bold cyan] • [green]Deterministic AST Ingestion[/green]"))

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        progress.add_task(description="Traversing filesystem & parsing AST...", total=None)
        result = scan_codebase(path)

    # Telemetry Table
    stat_table = Table(title="📦 Ingestion Telemetry & File Filters")
    stat_table.add_column("Metric", style="cyan")
    stat_table.add_column("Value", style="bold green")
    stat_table.add_row("Scanned Files", str(result.stats.total_files_scanned))
    stat_table.add_row("Python Files Parsed", str(result.stats.python_files_parsed))
    stat_table.add_row("Bloat Items Filtered", str(result.stats.ignored_bloat_files))
    stat_table.add_row("Lines of Python Code", str(result.stats.total_loc))
    console.print(stat_table)

    # Frameworks Table
    if result.frameworks:
        fw_table = Table(title="🧠 Detected AI Frameworks & Vector Stores")
        fw_table.add_column("Framework", style="bold magenta")
        fw_table.add_column("Category", style="yellow")
        fw_table.add_column("Imported Symbols", style="white")
        for fw in result.frameworks:
            fw_table.add_row(
                fw.framework_name,
                fw.category,
                ", ".join(fw.imported_symbols[:3]) if fw.imported_symbols else "top-level",
            )
        console.print(fw_table)
    else:
        console.print("[yellow]No recognized GenAI frameworks detected in imports.[/yellow]")

    # System Prompts Table
    if result.system_prompts:
        prompt_table = Table(title=f"📜 System Prompts Discovered ({len(result.system_prompts)})")
        prompt_table.add_column("Identifier", style="cyan")
        prompt_table.add_column("Type", style="green")
        prompt_table.add_column("File", style="dim")
        prompt_table.add_column("Preview", style="white")
        for p in result.system_prompts:
            preview = p.content.replace("\n", " ")[:60] + "..." if len(p.content) > 60 else p.content
            prompt_table.add_row(p.variable_name or "SystemPrompt", p.prompt_type, p.source_file, preview)
        console.print(prompt_table)
    else:
        console.print("[dim]No string-constant system prompts detected in AST.[/dim]")

    if result.raw_env_lookups:
        console.print(f"[bold]Discovered os.getenv keys:[/bold] [yellow]{', '.join(result.raw_env_lookups)}[/yellow]")


@app.command()
def generate(
    path: str = typer.Argument(".", help="Path to local codebase repository"),
    output_dir: str = typer.Option(".", "--output-dir", "-o", help="Target output directory"),
    validate_mermaid: bool = typer.Option(True, "--validate-mermaid/--no-validate-mermaid", help="Verify Mermaid syntax"),
    overwrite: bool = typer.Option(False, "--overwrite", "-w", help="Overwrite existing README.md"),
):
    """
    Run full multi-agent pipeline: Generates README.md, ARCHITECTURE.md, and validated Mermaid diagram.
    """
    console.print(Panel.fit("[bold cyan]GenDocuAgent[/bold cyan] • [bold magenta]Lead Multi-Agent Synthesis Pipeline[/bold magenta]"))

    out_path = Path(output_dir).resolve()
    out_path.mkdir(parents=True, exist_ok=True)

    readme_file = out_path / "README.md"
    arch_file = out_path / "ARCHITECTURE.md"
    mermaid_file = out_path / "architecture.mmd"
    env_file = out_path / ".env.example"

    if not overwrite and readme_file.exists():
        console.print(f"[yellow]Notice:[/yellow] {readme_file.name} already exists. Use --overwrite to replace.")

    pipeline = DocuGenPipeline()
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=False,
    ) as progress:
        task = progress.add_task(description="[cyan]Executing agent state machine...", total=5)

        progress.update(task, description="[1/5] Ingesting Python AST & filtering bloat...", advance=1)
        state = pipeline.run(path)
        progress.update(task, description="[5/5] Pipeline completed successfully!", completed=5)

    if not state.documentation:
        console.print("[red]Error: Pipeline failed to assemble documentation.[/red]")
        sys.exit(1)

    # Write files
    readme_file.write_text(state.documentation.readme_markdown, encoding="utf-8")
    arch_file.write_text(state.documentation.architecture_markdown, encoding="utf-8")
    mermaid_file.write_text(state.documentation.mermaid_diagram, encoding="utf-8")
    env_file.write_text(state.documentation.env_example, encoding="utf-8")

    console.print(Panel(
        f"[bold green]✔ Successfully generated documentation bundle:[/bold green]\n"
        f"  📄 [bold]{readme_file}[/bold] (Hero section, diagram, components, eval table)\n"
        f"  📐 [bold]{arch_file}[/bold] (Deep architecture specification)\n"
        f"  📊 [bold]{mermaid_file}[/bold] (Validated Mermaid flowchart)\n"
        f"  🔐 [bold]{env_file}[/bold] (Sanitized credentials blueprint)\n\n"
        f"[dim]Mermaid Validation: Passed={state.mermaid.is_valid} • Repairs Applied={len(state.mermaid.repairs_applied)}[/dim]",
        title="Artifacts Created",
        border_style="green",
    ))


@app.command(name="validate-mermaid")
def validate_mermaid_cmd(
    file_path: Optional[str] = typer.Option(None, "--file", "-f", help="Path to Mermaid diagram file (.mmd)"),
    code: Optional[str] = typer.Option(None, "--code", "-c", help="Raw Mermaid code string to validate"),
):
    """
    Standalone validation loop: Verifies Mermaid.js syntax and auto-repairs common formatting errors.
    """
    console.print("[bold cyan]Mermaid.js Syntax Validation Loop[/bold cyan]")
    raw_content = ""

    if file_path:
        p = Path(file_path)
        if not p.exists():
            console.print(f"[red]Error: File not found: {file_path}[/red]")
            sys.exit(1)
        raw_content = p.read_text(encoding="utf-8")
    elif code:
        raw_content = code
    else:
        console.print("[yellow]Provide either --file <path> or --code <diagram_string>[/yellow]")
        return

    agent = MermaidValidatorAgent()
    res = agent.validate_and_repair(raw_content)

    if res.syntax_errors:
        console.print(f"[yellow]Detected {len(res.syntax_errors)} syntax anomalies:[/yellow]")
        for err in res.syntax_errors:
            console.print(f"  ❌ {err}")

    if res.repairs_applied:
        console.print(f"[green]Applied {len(res.repairs_applied)} auto-repairs:[/green]")
        for rep in res.repairs_applied:
            console.print(f"  🔧 {rep}")

    console.print("\n[bold]Validated Mermaid Diagram:[/bold]")
    console.print(Syntax(res.validated_code, "mermaid", theme="monokai", line_numbers=True))


@app.command(name="eval-audit")
def eval_audit(
    path: str = typer.Argument(".", help="Path to codebase repository"),
):
    """
    Extracts benchmark metrics from JSON logs or synthesizes an Intended Evaluation Plan.
    """
    console.print(Panel.fit("[bold cyan]GenDocuAgent[/bold cyan] • [bold magenta]Evaluation Benchmark Auditor[/bold magenta]"))
    ingestion = scan_codebase(path)
    agent = EvalExtractorAgent()
    res = agent.audit(ingestion)

    title = "🎯 Extracted Benchmark Metrics" if res.has_real_eval_data else "⚠️ Intended Evaluation Plan (Fallback)"
    table = Table(title=title)
    table.add_column("Metric", style="cyan")
    table.add_column("Category", style="yellow")
    table.add_column("Score", style="bold green")
    table.add_column("Target", style="magenta")
    table.add_column("Source", style="dim")

    for m in res.metrics:
        score_val = f"{m.score:.2f}" if m.score is not None else "Pending"
        table.add_row(m.metric_name, m.category, score_val, f"≥ {m.target:.2f}", m.benchmark_source)

    console.print(table)
    console.print(f"\n[bold]Recommended Run Command:[/bold] [green]{res.test_run_command}[/green]")


def main():
    app()


if __name__ == "__main__":
    main()
