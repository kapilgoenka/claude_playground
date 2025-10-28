# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Code Style

- **Line length**: 88 characters maximum
- Wrap lines where necessary to maintain this limit

### File Header Comments

All files must begin with a header comment containing the original prompt that
generated the file. Format:

**Python files:**
```python
# PROMPT:
#
# [prompt text, wrapped at 88 characters]
#

[code starts here]
```

**JavaScript files:**
```javascript
// PROMPT:
//
// [prompt text, wrapped at 88 characters]
//

[code starts here]
```

The header includes:
- "PROMPT:" label on the first line
- Empty comment line after the label
- The prompt text with proper line wrapping
- Empty comment line at the end
- Blank line before code begins

## Running Code

**Python files:**
```bash
python <filename>.py
```

**JavaScript files:**
```bash
node <filename>.js
```
