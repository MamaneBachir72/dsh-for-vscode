import * as vscode from 'vscode';

export class HarnessWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'deepseek.harnessView';

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _port: number = 3018
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview(): string {
        return `<!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    box-sizing: border-box;
                }
                html, body {
                    width: 100%;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    /* Utilise la couleur de fond native du thème de VS Code */
                    background-color: var(--vscode-sideBar-background, var(--vscode-editor-background, #1e1e1e));
                    color: var(--vscode-editor-foreground, #cccccc);
                }
                .iframe-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    flex-grow: 1;
                    /* Filtre optionnel pour adoucir les Webviews blanches natives */
                    background-color: transparent;
                }
            </style>
        </head>
        <body>
            <div class="iframe-container">
                <iframe src="http://localhost:${this._port}"></iframe>
            </div>
        </body>
        </html>`;
    }
}