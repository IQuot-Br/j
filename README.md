# Nova Hub App

Aplicação web com autenticação, admin, threads, blog, dev logs, notificações e anúncios.

## Rodar localmente

```bash
npm install
node server.js
```

Acesse:
- http://localhost:3000
- http://localhost:3000/admin-panel

## Docker

```bash
docker build -t nova-hub-app .
docker run -p 3000:3000 nova-hub-app
```

## Kubernetes / Ingress

Aplicar manifests:

```bash
kubectl apply -f k8s/
```

O Ingress usa o host `nova-hub.local`.
Para testar localmente, adicione no hosts:

```text
127.0.0.1 nova-hub.local
```
