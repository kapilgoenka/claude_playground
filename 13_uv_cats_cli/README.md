# uv-cats

A simple CLI tool to display cat breed information using TheCatAPI.

## Installation

```bash
pip install uv-cats
```

## Usage

Get information about a specific cat breed:

```bash
uv-cats Siamese
```

This will display:
- Origin
- Temperament
- Life Span
- Weight
- Wikipedia link (if available)

## Example

```bash
$ uv-cats Siamese

-----------Siamese------------
Origin: Thailand
Temperament: Active, Agile, Clever, Sociable, Loving, Energetic
Life Span: 12 - 15 years
Weight: 8 - 15 lbs

Learn more: https://en.wikipedia.org/wiki/Siamese_cat
```

## Development

This project uses `uv` for dependency management.

```bash
# Install dependencies
uv sync

# Run tests
uv run pytest

# Run the application
uv run uv-cats Siamese
```

## License

MIT
