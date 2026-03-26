/**
 * Sessao em memoria do MCP Server.
 * Armazena JWT e companyId obtidos via login.
 * Todas as tools usam session.companyId e session.jwt automaticamente.
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

  setFromLogin(jwt: string, companyId: string, user: UserInfo): void {
    this._jwt = jwt;
    this._companyId = companyId;
    this._user = user;
  }

  requireAuth(): void {
    if (!this._jwt) {
      throw new Error(
        "Voce precisa fazer login primeiro. Use a tool 'login' com email e senha."
      );
    }
    if (!this._companyId) {
      throw new Error(
        "Login realizado, mas nenhuma empresa associada ao usuario. Verifique o cadastro."
      );
    }
  }

  summary(): string {
    if (!this.isLoggedIn) {
      return "Nao logado. Use login(email, password) primeiro.";
    }
    return [
      `Logado como: ${this._user?.name} (${this._user?.email})`,
      `Empresa (companyId): ${this._companyId}`,
    ].join("\n");
  }

  clear(): void {
    this._jwt = "";
    this._companyId = "";
    this._user = null;
  }
}

export const session = new Session();
