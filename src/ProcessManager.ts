import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';

export class ProcessManager {
    private process: ChildProcess | null = null;
    private outputChannel: vscode.OutputChannel;
    private isRunning: boolean = false;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * Démarrer le daemon DeepSeek Harness
     */
    public start(port: number = 3018): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                this.log('Le processus DeepSeek Harness tourne déjà.');
                return resolve(true);
            }

            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            
            // L'option --no-open (ou l'argument équivalent du CLI dsh) empêche l'ouverture automatique du navigateur
            const args = ['@deepseek-ai/dsh', 'web', '--port', port.toString(), '--no-open'];

            this.log(`Démarrage du serveur dsh sur le port ${port}...`);

            // Lancement du sous-processus
            this.process = spawn('npx', args, {
                cwd: workspaceFolder || process.cwd(),
                shell: true,
                env: { 
                    ...process.env,
                    // Désactive l'ouverture auto des CLI Node standards si supporté
                    BROWSER: 'none'
                }
            });

            let isResolved = false;

            this.process.stdout?.on('data', (data: Buffer) => {
                const message = data.toString();
                this.log(`[dsh stdout]: ${message}`);

                // Détection du démarrage réussi
                if (!isResolved && (message.includes('Server running') || message.includes('http://localhost') || message.includes('3018'))) {
                    this.isRunning = true;
                    isResolved = true;
                    resolve(true);
                }
            });

            this.process.stderr?.on('data', (data: Buffer) => {
                this.log(`[dsh stderr]: ${data.toString()}`);
            });

            this.process.on('error', (error) => {
                this.log(`Erreur de démarrage du processus : ${error.message}`);
                this.isRunning = false;
                if (!isResolved) {
                    isResolved = true;
                    reject(error);
                }
            });

            this.process.on('close', (code) => {
                this.log(`Le processus dsh s'est arrêté avec le code : ${code}`);
                this.isRunning = false;
                this.process = null;
            });

            // Sécurité : valide la promesse au bout de 4 secondes si le serveur écoute déjà
            setTimeout(() => {
                if (!isResolved) {
                    this.isRunning = true;
                    isResolved = true;
                    resolve(true);
                }
            }, 4000);
        });
    }

    /**
     * Arrêter proprement le sous-processus dsh
     */
    public stop(): void {
        if (this.process) {
            this.log('Arrêt du daemon DeepSeek Harness...');
            this.process.kill('SIGTERM');
            this.process = null;
            this.isRunning = false;
        }
    }

    public getStatus(): boolean {
        return this.isRunning;
    }

    private log(message: string): void {
        this.outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] ${message}`);
    }
}