# dracht.io
You can run the dracht.io site using `npm start`. For development you can run `gulp` which uses nodemon and browser-sync.  

## Install
```bash
$ npm install
$ knex-migrator init --mgpath node_modules/ghost
$ gulp serve
```

## Docs
The documentation for the dracht.io website is generated from the folders and markdown files in the `docs` directory. Each folder is a category, i.e., `tutorials`, and every file in that folder will be rendered under that category. So simply adding a new folder will add a new section to the docs, and so on.

### Config
The docs by default sort folders and files alphabetically. This can be changed by modifying `docs.conf.json`. Here's an example config file:
```
{
  "getting-started": [
    "introduction"
  ],
  "api": [
    "srf"
  ]
}
```
Custom orders can be specified by creating an JSON object with a directory as the key and an array of files in a specified order as the value. In this case the `api` section in the documentation will render `srf.md` first.

### API
You can generate the API docs by running the `docs` gulp task:
```
 $ gulp docs
```
This takes the `lib` directory in the `drachtio` folder (which is cloned from the drachtio-srf git repo) and generates markdown files in `docs > api`.
