# Implantação passo a passo

Roteiro para colocar o projeto no ar numa VM do Google Cloud, na ordem do
capítulo "Preparação e implantação do back-end" da Sprint 18. Troque:

- `USUARIO` → o seu usuário na VM (o que aparece antes do `@` no SSH);
- `IP` → o IP externo da VM;
- `DOMINIO` → o subdomínio registrado no FreeDNS (ex.: `leoaround.mooo.com`).

> Se o login da VM sugerir `do-release-upgrade` (Ubuntu 24.04), **não** rode:
> é uma troca de versão inteira do sistema, e este guia é para o 22.04.

> Os comandos de MongoDB e Node do curso são para o Ubuntu 18.04 e não
> funcionam no 22.04 que a própria lição manda escolher. Os daqui seguem a
> instrução oficial atual. Se algo mudar, confira em
> <https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/>.

## No Windows

Use o **PowerShell** (menu Iniciar → "PowerShell"; o terminal do VS Code também
serve). O Windows 10/11 já traz `ssh`, `ssh-keygen` e `scp`. Diferenças:

| Linux/Mac | PowerShell |
| --- | --- |
| `cat ~/.ssh/id_ed25519.pub` | `Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub` |
| `ssh-add ~/.ssh/id_ed25519` | **não precisa**: o `ssh` usa a chave `id_ed25519` sozinho (e o serviço `ssh-agent` vem desligado no Windows) |
| `VITE_API_URL=https://api.DOMINIO npm run build` | `$env:VITE_API_URL="https://api.DOMINIO"; npm run build` |
| `scp -r ./dist/* ...` | `scp -r .\dist USUARIO@IP:/home/USUARIO/frontend` (sem a pasta `frontend` na VM, o `scp` a cria com o conteúdo de `dist`) |

No Google Cloud, o **usuário** da VM sai do comentário da chave (o texto
depois do `-C`). Use um nome simples, sem `@`: `-C "leonardo"` → usuário
`leonardo`.

## 1. VM

Google Cloud → Compute Engine → **Create instance**:

- série **E2**, tipo **e2-micro**;
- disco **Ubuntu 22.04 LTS**;
- marque **Allow HTTP traffic** e **Allow HTTPS traffic**;
- em Security → **Add SSH key**, cole a sua chave **pública**:

```bash
# na sua máquina
ssh-keygen -t ed25519 -C "leonardo"   # o comentário vira o usuário da VM
cat ~/.ssh/id_ed25519.pub                                 # copie ESTA (a .pub)
ssh-add ~/.ssh/id_ed25519
ssh USUARIO@IP
```

## 2. Node, MongoDB e Git (na VM)

```bash
# Sem isto, cada instalação abre uma janela roxa ("Which services should be
# restarted?") que às vezes não aceita o teclado no Terminal do Windows.
# 'a' = reinicia sozinho os serviços recomendados, sem perguntar.
echo "\$nrconf{restart} = 'a';" | sudo tee /etc/needrestart/conf.d/99-auto.conf

# Atualizações do sistema
sudo apt-get update && sudo apt-get upgrade -y

# Swap de 2 GB: a e2-micro tem só 1 GB de RAM; sem swap, o MongoDB ou o
# npm podem ser encerrados por falta de memória
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # a linha Swap deve mostrar 2.0Gi

# Node — use a mesma versão principal da sua máquina (node -v); ex.: 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# MongoDB 8.0 para Ubuntu 22.04 (jammy)
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod   # liga agora e a cada reinício da VM
mongosh --eval 'db.runCommand({ ping: 1 })'   # deve responder { ok: 1 }
```

## 3. Back-end com PM2 (na VM)

```bash
cd ~
git clone https://github.com/oleodias/web_project_api_full.git
cd web_project_api_full/backend
npm ci --omit=dev

# .env — SÓ no servidor. A chave: 32 bytes aleatórios em hexadecimal.
echo "NODE_ENV=production" > .env
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
chmod 600 .env

sudo npm install -g pm2
pm2 start app.js --name app
pm2 startup        # IMPRIME um comando "sudo env PATH=..." — copie e EXECUTE
pm2 save
pm2 logs app --lines 20   # deve mostrar "Conectado ao MongoDB"
```

> Sem o `JWT_SECRET` no `.env`, o login responde 500 (o `jwt.sign` não
> assina com uma chave vazia). Se isso acontecer, confira o `.env` e rode
> `pm2 restart app`.

## 4. Domínio (FreeDNS)

<https://freedns.afraid.org> → Subdomains → **Add**, três vezes, todos do
tipo **A** com o **IP** da VM:

| Subdomain | Para quê |
| --- | --- |
| `DOMINIO` | o front-end |
| `www.DOMINIO` | o front-end, com www |
| `api.DOMINIO` | a API |

Evite os domínios mais populares da lista (o Let's Encrypt limita os
certificados por domínio). A propagação leva de 10 a 15 minutos.

## 5. Front-end (na sua máquina → VM)

```bash
# na VM: o NGINX roda como outro usuário (www-data); no Ubuntu 22.04 as
# pastas /home/* nascem fechadas (750). Sem isto, o site dá 403:
chmod o+x /home/USUARIO

# na sua máquina, dentro de frontend/ — com Vite a pasta é dist/, não build/
VITE_API_URL=https://api.DOMINIO npm run build
scp -r ./dist USUARIO@IP:/home/USUARIO/frontend   # cria ~/frontend com o conteúdo de dist

# na VM: o scp vindo do Windows cria as pastas com permissão 700 (só o dono);
# o www-data não entra e o site responde 403 Forbidden. Abrir para leitura:
chmod -R o+rX ~/frontend
```

## 6. NGINX e firewall (na VM)

```bash
sudo apt-get install -y nginx
sudo ufw allow OpenSSH        # ANTES do enable, senão você se tranca fora
sudo ufw allow 'Nginx Full'   # 80 e 443
sudo ufw enable
sudo nano /etc/nginx/sites-available/default   # apague tudo e cole o abaixo
```

```nginx
server {
  listen 80;
  server_name api.DOMINIO;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

server {
  listen 80;
  server_name DOMINIO www.DOMINIO;

  root /home/USUARIO/frontend;

  location / {
    # /signin, /signup: não são arquivos; caem no index.html e o React
    # Router decide. Sem esta linha, um F5 nessas páginas dá 404.
    try_files $uri $uri/ /index.html =404;
  }
}
```

```bash
sudo nginx -t                  # "syntax is ok" e "test is successful"
sudo systemctl reload nginx
```

Se aparecer `could not build server_names_hash`, acrescente
`server_names_hash_bucket_size 128;` dentro do bloco `http` de
`/etc/nginx/nginx.conf`.

## 7. HTTPS (na VM)

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx --no-redirect -d DOMINIO -d www.DOMINIO -d api.DOMINIO
```

- e-mail: o seu; termos: `Y`; compartilhar o e-mail com a EFF: você decide.
- `--no-redirect`: o checklist pede acesso por HTTP **e** HTTPS. As versões
  atuais do Certbot não perguntam mais e redirecionam por padrão.
- confira: <https://www.sslshopper.com/ssl-checker.html> com os três nomes.
- `sudo certbot renew --dry-run` testa a renovação automática.

## 8. Chave SSH da TripleTen (para o revisor)

```bash
nano ~/.ssh/authorized_keys   # cole a chave do fim da lição, numa linha nova
```

A chave da lição começa com `ssh-ed25519`, mas o conteúdo
(`AAAAB3NzaC1yc2E...`) é de uma chave **RSA**. Se o revisor não conseguir
entrar, troque o começo da linha para `ssh-rsa`.

## 9. Conferência final (checklist)

```bash
curl -s https://api.DOMINIO/cards                 # {"message":"Autorização necessária"} (401)
curl -s http://api.DOMINIO/cards                  # o mesmo, por HTTP
curl -s -m 3 https://api.DOMINIO/crash-test       # derruba o processo...
sleep 2; curl -s https://api.DOMINIO/cards        # ...e o PM2 já o subiu de novo
pm2 list                                          # coluna ↺ (restarts) aumentou
```

No navegador, em `https://DOMINIO`: cadastro, login, editar perfil e avatar,
criar e excluir cartão, curtir e descurtir. Depois, preencha os endereços no
`README.md`.

## Atualizar depois

```bash
# back-end, na VM
cd ~/web_project_api_full && git pull && cd backend && npm ci --omit=dev && pm2 restart app

# front-end, na sua máquina (PowerShell, dentro de frontend/): apaga a versão
# antiga, envia a nova e abre as permissões
$env:VITE_API_URL="https://api.DOMINIO"; npm run build
ssh USUARIO@IP "rm -rf ~/frontend"
scp -r .\dist USUARIO@IP:/home/USUARIO/frontend
ssh USUARIO@IP "chmod -R o+rX ~/frontend"
```

> **Depois da aprovação:** remova a rota `/crash-test` do `backend/app.js`.
