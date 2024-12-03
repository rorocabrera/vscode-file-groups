# VS Code File Groups

A VS Code extension that helps you manage and quickly switch between groups of files. Perfect for working with large codebases where you frequently need to switch between different sets of files.

## Features

- Save currently open files as a named group
- Quickly switch between file groups
- Close all current files and open a specific group
- Workspace-specific file groups
- Keyboard shortcuts for all operations

## Installation

1. Clone this repository
```bash
git clone https://github.com/rorocabrera/vscode-file-groups.git
cd vscode-file-groups
```

2. Install dependencies and build
```bash
npm install
npm run compile
npx vsce package
```

3. Install the extension in VS Code
```bash
code --install-extension vscode-file-groups-0.1.0.vsix
```

## Usage

### Creating a File Group
1. Open the files you want to group together
2. Press `Cmd+K Cmd+S` (Mac) or `Ctrl+K Ctrl+S` (Windows/Linux)
3. Enter a name for your group

### Opening a File Group
1. Press `Cmd+K Cmd+O` (Mac) or `Ctrl+K Ctrl+O` (Windows/Linux)
2. Select the group you want to open from the dropdown

### File Groups Configuration
Groups are stored in `.vscode/filegroups.json` in your workspace. You can edit this file directly if needed:

```json
{
  "services": [
    "src/services/auth.service.ts",
    "src/services/api.service.ts"
  ],
  "components": [
    "src/components/Header.tsx",
    "src/components/Footer.tsx"
  ]
}
```

## Development

### Building
```bash
npm run compile
```

### Packaging
```bash
npx vsce package
```

## License

MIT