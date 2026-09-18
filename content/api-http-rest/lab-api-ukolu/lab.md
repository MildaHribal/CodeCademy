---
title: "Lab: API úkolů"
runtime: node
seed:
  "index.js": |
    const express = require('express');
    const app = express();

    app.use(express.json());

    // Výchozí data
    let tasks = [
      { id: 1, title: 'Koupit mléko', done: false },
      { id: 2, title: 'Napsat API', done: true }
    ];

    module.exports = app;
  "package.json": |
    {
      "dependencies": {
        "express": "^4.19.2",
        "zod": "^3.23.8",
        "cors": "^2.8.5"
      }
    }
solution:
  "index.js": |
    const express = require('express');
    const cors = require('cors');
    const { z } = require('zod');
    const app = express();

    app.use(cors());
    app.use(express.json());

    let tasks = [
      { id: 1, title: 'Koupit mléko', done: false },
      { id: 2, title: 'Napsat API', done: true }
    ];

    const taskSchema = z.object({
      title: z.string().min(1, 'Název je povinný'),
      done: z.boolean().optional().default(false)
    });

    app.get('/tasks', (req, res) => {
      let result = tasks;

      if (req.query.done !== undefined) {
        const isDone = req.query.done === 'true';
        result = result.filter(t => t.done === isDone);
      }

      const limit = req.query.limit ? parseInt(req.query.limit, 10) : result.length;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
      
      res.json(result.slice(offset, offset + limit));
    });

    app.get('/tasks/:id', (req, res) => {
      const id = parseInt(req.params.id, 10);
      const task = tasks.find(t => t.id === id);
      if (!task) {
        return res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Úkol nebyl nalezen' });
      }
      res.json(task);
    });

    app.post('/tasks', (req, res) => {
      const parsed = taskSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: parsed.error.errors[0].message });
      }

      const newTask = {
        id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        title: parsed.data.title,
        done: parsed.data.done
      };
      tasks.push(newTask);
      res.status(201).json(newTask);
    });

    module.exports = app;
  "package.json": |
    {
      "dependencies": {
        "express": "^4.19.2",
        "zod": "^3.23.8",
        "cors": "^2.8.5"
      }
    }
tests: |
  const request = require('supertest');
  const app = require('./index.js');

  const getRes = await request(app).get('/tasks');
  assert.equal(getRes.status, 200, 'GET /tasks vrací status 200');

  const postRes = await request(app).post('/tasks').send({ title: 'Nový úkol' });
  assert.equal(postRes.status, 201, 'Platný POST vrací 201');
  
  const badPostRes = await request(app).post('/tasks').send({ title: '' });
  assert.equal(badPostRes.status, 400, 'Neplatný POST vrací 400');
  assert.equal(badPostRes.body.title, 'Bad Request', 'Chyba je v jednotném formátu');
---

Tento lab spojí všechno, co ses o návrhu REST API naučil. Postavíš API pro správu úkolů v Expressu, přidáš do něj Zod pro validaci a nastavíš CORS hlavičky.

Tvé API musí splňovat následující požadavky:

- [ ] Použij middleware `cors()`, aby se dalo API volat z jakékoliv domény.
- [ ] Nakódovat `GET /tasks`, které vrátí seznam úkolů.
- [ ] `GET /tasks` musí podporovat query parametry `limit` a `offset` pro stránkování.
- [ ] `GET /tasks` musí podporovat query parametr `done` (`true` nebo `false`) pro filtrování úkolů podle stavu.
- [ ] Nakódovat `GET /tasks/:id`, které vrátí detail úkolu nebo status `404`, pokud úkol neexistuje.
- [ ] Nakódovat `POST /tasks`, které zvaliduje tělo přes Zod (požaduje aspoň neprázdný string v `title` a volitelně boolean `done`, který je výchoze `false`).
- [ ] Pokud tělo `POST /tasks` není validní, vrať `400 Bad Request` v konzistentním formátu (např. objekt s `type`, `title`, `status`, `detail`).
- [ ] Pokud je `POST /tasks` validní, ulož úkol s novým unikátním ID a vrať status `201 Created` spolu s novým úkolem.
- [ ] Všechny chyby (např. 404 u `GET /tasks/:id`) musí vracet JSON objekt ve shodném "Problem Details" formátu (minimálně klíče `title`, `status`, `detail`).

Nejprve si rozmysli schémata v Zodu, poté naplň jednotlivé routy a nezapomeň na jednotný tvar odpovědí u chybových stavů.
