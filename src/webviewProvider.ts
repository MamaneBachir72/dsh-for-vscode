import * as vscode from 'vscode';

export class HarnessWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'deepseek.harnessView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _serverPort: number = 3018
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        // Injecte le serveur local dsh web dans l'iframe/webview
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Écoute les messages envoyés depuis l'UI vers l'Extension Host
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'promptSubmitted': {
                    vscode.window.showInformationMessage(`Prompt envoyé à dsh: ${data.value}`);
                    break;
                }
                case 'error': {
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const serverUrl = `http://localhost:${this._serverPort}`;

        return /* html */`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        background-color: var(--vscode-editor-backgroundColor);
                    }
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                </style>
            </head>
            <body>
                <iframe src="${serverUrl}" id="dsh-frame"></iframe>
            </body>
            </html>
        `;
    }
}