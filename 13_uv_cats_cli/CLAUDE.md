# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A CLI tool that fetches and displays cat breed information from TheCatAPI. The project uses `uv` for package management and is configured for publishing to PyPI/TestPyPI.

## Python Version

Requires Python 3.14 or higher (specified in `.python-version` and `pyproject.toml`).

## Package Management with UV

This project uses `uv` instead of pip or poetry. All dependency management and virtual environment operations must be done through `uv`.

Key behavior:
- Virtual environment (`.venv/`) is automatically managed by uv
- Always use `uv run` prefix to execute commands in the project environment
- `uv.lock` ensures reproducible dependency resolution

## Common Commands

| Command | Description |
|---------|-------------|
| `uv sync` | Install/sync dependencies from uv.lock |
| `uv add <package>` | Add a runtime dependency |
| `uv add --dev <package>` | Add a development dependency |
| `uv run uv-cats Siamese` | Run the CLI tool (recommended) |
| `uv run main.py Siamese` | Run via main.py directly |
| `uv run pytest` | Run all tests |
| `uv run pytest -v` | Run tests with verbose output |
| `uv run pytest tests/test_main.py` | Run a specific test file |
| `uv run pytest tests/test_main.py::TestMain::test_main_success` | Run a specific test |
| `uv run pytest --cov=. --cov-report=term-missing` | Run tests with coverage report |
| `uv build` | Build source distribution and wheel |
| `uv publish --publish-url https://test.pypi.org/legacy/` | Publish to TestPyPI |
| `uv publish` | Publish to PyPI |

**Publishing notes:**
- Requires TestPyPI/PyPI API token
- Use `__token__` as username and your token as password
- Or set `UV_PUBLISH_TOKEN` environment variable

## Project Structure

```
uv_cats/
├── main.py              # CLI entry point with argparse interface
├── tests/
│   ├── __init__.py
│   └── test_main.py     # Comprehensive unit tests (12 tests)
├── pyproject.toml       # Project metadata, dependencies, build config
├── uv.lock              # Locked dependency versions
├── README.md            # User-facing documentation
└── CLAUDE.md            # This file
```

## Code Architecture

### main.py Structure

The application follows a functional design with clear separation of concerns:

1. **`get_breeds_info()`** - Fetches breed data from TheCatAPI
   - Makes GET request to `https://api.thecatapi.com/v1/breeds`
   - Returns JSON array of all breeds

2. **`find_breed_info(breed_name)`** - Searches for specific breed
   - Linear search through breeds array
   - Case-sensitive match on breed name
   - Returns breed dict or None

3. **`display_breed_profile(breed)`** - Formats and prints breed information
   - Displays: origin, temperament, life span, weight
   - Conditionally shows Wikipedia link if available

4. **`parse_args()`** - CLI argument parsing
   - Single required positional argument: breed name
   - Uses argparse for standard help/error messages

5. **`main()`** - Orchestrates the workflow
   - Parses arguments → Finds breed → Displays profile
   - Returns 0 on success, 1 on error
   - Error handling for API failures and missing breeds

### Entry Point

Configured via `pyproject.toml`:
```toml
[project.scripts]
uv-cats = "main:main"
```

This creates the `uv-cats` command that calls `main()`.

### Testing Strategy

Tests in `tests/test_main.py` use:
- **Mocking**: `unittest.mock.patch` for API calls and argument parsing
- **Fixtures**: `capsys` for capturing console output
- **Coverage**: All functions tested with success/error/edge cases

Test organization:
- `TestGetBreedsInfo` - API interaction tests
- `TestFindBreedInfo` - Search logic tests (found, not found, case-sensitive)
- `TestDisplayBreedProfile` - Output formatting tests
- `TestParseArgs` - CLI argument validation
- `TestMain` - Integration tests

## Build Configuration

Uses **Hatchling** as build backend (PEP 517/518 compliant):

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["."]  # Flat structure: includes *.py from root
```

The `packages = ["."]` configuration handles the flat project layout (main.py at root rather than in a package directory).

## Dependencies

**Runtime:**
- `requests>=2.32.5` - HTTP client for TheCatAPI

**Development:**
- `pytest>=8.4.2` - Testing framework

## API Integration

Uses TheCatAPI (no authentication required):
- **Endpoint**: `GET https://api.thecatapi.com/v1/breeds`
- **Response**: JSON array of breed objects
- **Required fields**: name, origin, temperament, life_span, weight.imperial
- **Optional fields**: wikipedia_url
