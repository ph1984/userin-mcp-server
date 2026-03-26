import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { config } from "../config.js";
import { session } from "../session.js";

export function registerAuthTools(server: McpServer) {
  server.tool(
    "login",
    `Faz login na plataforma UserIn com email e senha. Retorna o JWT token e configura automaticamente a sessao.
Apos o login, TODAS as tools usam o token e companyId automaticamente — nao precisa passar companyId em nenhuma tool.
Chame uma vez no inicio da sessao. Para renovar o token, chame login novamente.`,
    {
      email: z.string().describe("Email do usuario"),
      password: z.string().describe("Senha do usuario"),
    },
    async ({ email, password }) => {
      const url = `${config.services.platform}/api/auth/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": config.auth.apiSecret,
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let result: unknown;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Resposta invalida do servidor: ${text.slice(0, 200)}`);
      }

      if (!response.ok) {
        const msg =
          typeof result === "object" && result !== null && "error" in result
            ? (result as { error: string }).error
            : text.slice(0, 200);
        throw new Error(`Login falhou: ${msg}`);
      }

      const data = result as {
        success: boolean;
        data: {
          token: string;
          user: { id: string; email: string; name: string; type: string };
        };
      };

      if (!data.success || !data.data?.token) {
        throw new Error("Login falhou: resposta inesperada do servidor");
      }

      const jwt = data.data.token;
      const user = data.data.user;

      let companyId = "";
      try {
        const payload = JSON.parse(
          Buffer.from(jwt.split(".")[1], "base64").toString()
        );
        companyId = payload.c || "";
      } catch {
        // ignore
      }

      if (!companyId) {
        const meResponse = await fetch(
          `${config.services.platform}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
              "x-api-secret": config.auth.apiSecret,
            },
          }
        );
        if (meResponse.ok) {
          const meData = (await meResponse.json()) as {
            data?: { company_id?: string };
          };
          companyId = meData.data?.company_id || "";
        }
      }

      if (!companyId) {
        throw new Error(
          "Login OK, mas nao foi possivel identificar a empresa do usuario. Verifique o cadastro."
        );
      }

      session.setFromLogin(jwt, companyId, user);

      return {
        content: [
          {
            type: "text" as const,
            text: [
              "Login realizado com sucesso!",
              `Usuario: ${user.name} (${user.email})`,
              `Empresa (companyId): ${companyId}`,
              "",
              "Todas as tools agora usam este token automaticamente.",
            ].join("\n"),
          },
        ],
      };
    }
  );

  server.tool(
    "get_current_user",
    "Retorna informacoes do usuario logado e da empresa ativa. Util para verificar se o login esta ativo.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: session.summary(),
          },
        ],
      };
    }
  );
}
