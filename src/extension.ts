// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";

const warningHtmlRaw = require("./webview/env-warning.html") as string;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log("✅ Env Gate activated");

  // implementation of the command defined in package.json
  const disposable = vscode.commands.registerCommand(
    "env-gate.resetSession",
    () => {
      acceptedFiles.clear();
      vscode.window.showInformationMessage(
        "You will be prompted again when opening .env files!",
      );
    },
  );

  context.subscriptions.push(disposable);

  const excludedPatterns = [
    ".env.example",
    ".env.example.local",
    ".env.example.development",
    ".env.example.production",
  ];

  const shouldSkipWarning = (uri: vscode.Uri): boolean => {
    const lowerPath = uri.fsPath.toLowerCase();
    return excludedPatterns.some((pattern) => lowerPath.endsWith(pattern));
  };

  // In-memory list (resets when VS Code is fully closed)
  const acceptedFiles = new Set<string>();

  class EnvConfirmationProvider implements vscode.CustomReadonlyEditorProvider {
    async openCustomDocument(uri: vscode.Uri) {
      return { uri } as vscode.CustomDocument;
    }

    async resolveCustomEditor(
      document: vscode.CustomDocument,
      webviewPanel: vscode.WebviewPanel,
    ) {
      const uriString = document.uri.toString();

      if (shouldSkipWarning(document.uri) || acceptedFiles.has(uriString)) {
        // console.log("accepted file!", uriString);
        // Small delay to let VS Code finish initializing the custom editor
        setTimeout(async () => {
          try {
            webviewPanel.dispose();
            await vscode.window.showTextDocument(document.uri, {
              preview:
                vscode.window.tabGroups.activeTabGroup.activeTab?.isPreview,
            });
          } catch (err) {
            console.error("Error switching to text document:", err);
          }
        }, 10);
        return;
      }

      const relativePath = vscode.workspace.asRelativePath(document.uri, false);
      const html = warningHtmlRaw.replace("{{RELATIVE_PATH}}", relativePath);

      webviewPanel.webview.options = { enableScripts: true };
      webviewPanel.webview.html = html;

      // Handle messages from the webview
      const messageDisposable = webviewPanel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.command === "cancel") {
            // Simply dispose the webview panel -> this closes the tab cleanly
            webviewPanel.dispose();
          } else if (message.command === "openAnyway") {
            acceptedFiles.add(uriString);

            // Close the confirmation view and open the real text editor
            webviewPanel.dispose();
            await vscode.window.showTextDocument(document.uri, {
              preview:
                vscode.window.tabGroups.activeTabGroup.activeTab?.isPreview,
              preserveFocus: false,
            });
          }
        },
      );

      // Clean up when the panel is closed
      webviewPanel.onDidDispose(() => {
        messageDisposable.dispose();
      });
    }
  }

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      "envGate.confirmation",
      new EnvConfirmationProvider(),
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
