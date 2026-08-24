import * as vscode from 'vscode';
import { ProcessManager } from './ProcessManager';

let processManager: ProcessManager | null = null;

export function activate(context: vscode.ExtensionContext) {
    // 1. Canal de journalisation dans l'onglet Output de VS Code
    const outputChannel = vscode.window.createOutputChannel("DeepSeek Harness");
    outputChannel.show(true);

    // 2. Instanciation du ProcessManager
    processManager = new ProcessManager(outputChannel);

    // 3. Commande manuelle de démarrage
    const startCmd = vscode.commands.registerCommand('vscode-deepseek-harness.start', async () => {
        try {
            await processManager?.start();
            vscode.window.showInformationMessage('DeepSeek Harness démarré avec succès !');
        } catch (err) {
            vscode.window.showErrorMessage('Échec du démarrage de DeepSeek Harness.');
        }
    });

    // 4. Nettoyage lors de la fermeture de VS Code
    context.subscriptions.push(startCmd);
    context.subscriptions.push({
        dispose: () => processManager?.stop()
    });
}

export function deactivate() {
    if (processManager) {
        processManager.stop();
    }
}