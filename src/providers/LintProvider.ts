"use strict";

import * as vscode from "vscode";
import * as cp from "child_process";

export default class LintProvider {

    private diagnostics: vscode.DiagnosticCollection;
    private config: vscode.WorkspaceConfiguration;
    private outputChannel: vscode.OutputChannel;

    public constructor() {
        this.diagnostics = vscode.languages.createDiagnosticCollection();
        this.config = vscode.workspace.getConfiguration("tlint-with-syntax");
        this.outputChannel = vscode.window.createOutputChannel('TLint with Syntax');
    }

    public activate(subscriptions: vscode.Disposable[]) {

        if (vscode.window.activeTextEditor) {
            this.check(vscode.window.activeTextEditor.document);
        }
        vscode.workspace.onDidCloseTextDocument(
            textDocument => {
                this.diagnostics.delete(textDocument.uri);
            },
            null,
            subscriptions
        );

        vscode.workspace.onDidOpenTextDocument(this.check, this);
        vscode.workspace.onDidSaveTextDocument(this.check, this);

        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.check(editor.document);
            }
        });

        vscode.workspace.onDidCloseTextDocument(
            textDocument => {
                this.diagnostics.delete(textDocument.uri);
            },
            null,
            subscriptions
        );
    }

    private check(textDocument: vscode.TextDocument) {
        if (textDocument.uri.scheme !== "file") {
            return;
        }
        if (!["php", "blade"].includes(textDocument.languageId)) {
            return;
        }
        this.config = vscode.workspace.getConfiguration("tlint-with-syntax");

        let command: string = this.config.exec + ' lint --json ' + this.getIncludedPolicies() + ' "' + textDocument.fileName + '"';
        let cwd: string = vscode.workspace.workspaceFolders[0].uri.fsPath;

        this.outputChannel.appendLine(`Executing: ${command} in ${cwd}`);

        cp.exec(command, { cwd: cwd }, (error, stdout: string) => {
            if (error) {
                this.outputChannel.appendLine(error.message);
                return;
            }

            this.outputChannel.appendLine(stdout);

            this.diagnostics.set(
                textDocument.uri,
                this.getDiagnostics(stdout)
            );
        });
    }

    private getDiagnostics(decoded: string): vscode.Diagnostic[] {
        let diagnostics: vscode.Diagnostic[] = [];
        let extraErrors = [];

        if (!this.IsJsonString(decoded)) {
            extraErrors = this.parseSyntaxError(decoded);
            if (extraErrors.length) {
                decoded = JSON.stringify({
                    errors: extraErrors,
                })
            } else {
                vscode.window.showErrorMessage('Error parsing linted file.');
                return diagnostics;
            }
        }
        let errors = JSON.parse(decoded);

        errors.errors.forEach((element) => {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(element.line - 1, 0),
                    new vscode.Position(element.line - 1, Number.MAX_VALUE)
                ),
                `TLint: ${element.message} (${element.source})`,
                this.getSeverity(element.source)
            ));
        });

        return diagnostics;
    }

    private getSeverity(source: string): vscode.DiagnosticSeverity {

        let severity = this.config.severities.hasOwnProperty(source) ? this.config.severities[source] : this.config.defaultSeverity;
        switch (severity) {
            case "hint":
                return vscode.DiagnosticSeverity.Hint;
            case "info":
                return vscode.DiagnosticSeverity.Information;
            case "warning":
                return vscode.DiagnosticSeverity.Warning;
            default:
                return vscode.DiagnosticSeverity.Error;
        }
    }

    private getIncludedPolicies(): string {
        let policies = [];
        this.config.only.forEach(policy => {
            policies.push("--only");
            policies.push(policy);
        });
        return policies.join(" ");
    }

    private IsJsonString(str: string): boolean {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    private parseSyntaxError(str: string): Array<any> {
        const lines = str.split("\n");
        let syntaxError = '';
        let lineNumber = null;
        const errors = [];

        if (lines[2].toLowerCase().includes('syntax error')) {
            const regex = /^(\d+) /;
            syntaxError = lines[2];
            lineNumber = Number(lines[3].match(regex)[1] || 1);

            errors.push({
                message: syntaxError,
                line: lineNumber,
                source: str,
            })
        }

        this.outputChannel.appendLine(JSON.stringify(lines));
        return errors;
    }
}