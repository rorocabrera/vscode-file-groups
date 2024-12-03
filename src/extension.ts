// extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface FileGroup {
    [groupName: string]: string[];
}

export function activate(context: vscode.ExtensionContext) {
    // Read file groups configuration
    const getFileGroups = (): FileGroup => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return {};
        }

        const configPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'filegroups.json');
        try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configContent);
        } catch (error) {
            return {};
        }
    };

    // Save current file groups configuration
    const saveFileGroups = (groups: FileGroup): void => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        const vscodeDir = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(vscodeDir);
        }

        const configPath = path.join(vscodeDir, 'filegroups.json');
        fs.writeFileSync(configPath, JSON.stringify(groups, null, 2));
    };

    // Command to open a specific file group
    const openFileGroup = async (groupName: string) => {
        const groups = getFileGroups();
        const files = groups[groupName];
        
        if (!files) {
            vscode.window.showErrorMessage(`Group "${groupName}" not found`);
            return;
        }

        // Close all current editors
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');

        // Open all files in the group
        for (const filePath of files) {
            const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (workspacePath) {
                const fullPath = path.join(workspacePath, filePath);
                const uri = vscode.Uri.file(fullPath);
                try {
                    const doc = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(doc, { preview: false });
                } catch (error) {
                    vscode.window.showWarningMessage(`Could not open ${filePath}`);
                }
            }
        }
    };

    // Command to save current open editors as a new group
    const saveCurrentAsGroup = async () => {
        const groupName = await vscode.window.showInputBox({
            prompt: 'Enter a name for the new file group',
            placeHolder: 'e.g., authFeature'
        });

        if (!groupName) {
            return;
        }

        const groups = getFileGroups();
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        
        if (!workspacePath) {
            return;
        }

        // Get all open editors
        const openFiles = vscode.window.tabGroups.all
            .flatMap(group => group.tabs)
            .filter(tab => tab.input instanceof vscode.TabInputText)
            .map(tab => {
                const filePath = (tab.input as vscode.TabInputText).uri.fsPath;
                return path.relative(workspacePath, filePath);
            });

        groups[groupName] = openFiles;
        saveFileGroups(groups);
        vscode.window.showInformationMessage(`Saved group "${groupName}" with ${openFiles.length} files`);
    };

    // Command to list and select a group to open
    const selectAndOpenGroup = async () => {
        const groups = getFileGroups();
        const groupNames = Object.keys(groups);

        if (groupNames.length === 0) {
            vscode.window.showInformationMessage('No file groups defined');
            return;
        }

        const selected = await vscode.window.showQuickPick(groupNames, {
            placeHolder: 'Select a file group to open'
        });

        if (selected) {
            await openFileGroup(selected);
        }
    };

    // Command to edit group definitions
    const editGroupDefinitions = async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        const configPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'filegroups.json');
        const uri = vscode.Uri.file(configPath);

        try {
            await vscode.workspace.openTextDocument(uri);
        } catch {
            // Create default config if it doesn't exist
            const defaultConfig: FileGroup = {
                example: ["src/example/file1.ts", "src/example/file2.ts"]
            };
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        }

        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
    };

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('fileGroups.openGroup', openFileGroup),
        vscode.commands.registerCommand('fileGroups.saveCurrentAsGroup', saveCurrentAsGroup),
        vscode.commands.registerCommand('fileGroups.selectAndOpenGroup', selectAndOpenGroup),
        vscode.commands.registerCommand('fileGroups.editDefinitions', editGroupDefinitions)
    );
}

export function deactivate() {}