/**
 * Sessao em memoria do MCP Server.
 * Armazena JWT, companyId e credenciais para auto-renovacao.
 */

interface UserInfo {
  id: string;
  email: string;
  name: string;
  type: string;
}

class Session {
  private _jwt = "";
  private _companyId = "";
  private _user: UserInfo | null = null;
  private _email = "";
  private _password = "";
  private _refreshing: Promise<void> | null = null;

  get jwt(): string {
    return this._jwt;
  }

  get companyId(): string {
    return this._companyId;
  }

  get user(): UserInfo | null {
    return this._user;
  }

  get isLoggedIn(): boolean {
    return !!this._jwt && !!this._companyId;
  }

  get canAutoRefresh(): boolean {
    return !!this._email && !!this._password;
  }

  get credentials(): { email: string; password: string } {
    return { email: this._email, password: this._password };
  }

  setCredentials(email: string, password: string): void {
    this._email = email;
    this._password = password;
  }

  setFromLogin(jwt: string, companyId: string, user: UserInfo): void {
    this._jwt = jwt;
    this._companyId = companyId;
    this._user = user;
    if (user.email) this._email = user.email;
  }

  requireAuth(): void {
    if (!this._jwt) {
      throw new Error(
        "Voce precisa fazer login primeiro. Configure USERIN_EMAIL e USERIN_PASSWORD, ou use a tool 'login'."
      );
    }
    if (!this._companyId) {
      throw new Error(
        "Login realizado, mas nenhuma empresa associada ao usuario. Verifique o cadastro."
      );
    }
  }

  /**
   * Marca que um refresh esta em andamento (evita refresh duplicado em requests concorrentes).
   */
  setRefreshing(promise: Promise<void>): void {
    this._refreshing = promise;
    promise.finally(() => { this._refreshing = null; });
  }

  getRefreshing(): Promise<void> | null {
    return this._refreshing;
  }

  summary(): string {
    if (!this.isLoggedIn) {
      return "Nao logado. Configure USERIN_EMAIL/USERIN_PASSWORD ou use login(email, password).";
    }
    return [
      `Logado como: ${this._user?.name} (${this._user?.email})`,
      `Empresa (companyId): ${this._companyId}`,
      `Auto-refresh: ${this.canAutoRefresh ? "ativo" : "inativo"}`,
    ].join("\n");
  }

  clear(): void {
    this._jwt = "";
    this._companyId = "";
    this._user = null;
  }
}

export const session = new Session();
