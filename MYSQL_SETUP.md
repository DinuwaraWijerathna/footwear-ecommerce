# STEPZ — MySQL Setup Guide (Singlish)

Hardcoded `PRODUCTS` array eka `app.js` walin ain karala, dan eeka MySQL database
ekakin fetch karanawa `stepz-api/get_products.php` kiyana PHP API eka mula karagena.

## Step 1 — XAMPP install karanawa
1. https://www.apachefriends.org walin XAMPP download karala install karanna.
2. XAMPP Control Panel eken **Apache** saha **MySQL** dekama Start karanna.

## Step 2 — Project eka htdocs folder ekata copy karanawa
1. XAMPP install karapu path eka hoyaganna (example: `C:\xampp\htdocs`).
2. Me project eke **muluma folder eka** (`footwear-ecommerce-main`) copy karala
   `htdocs` athule danna. Eeka `C:\xampp\htdocs\footwear-ecommerce-main` widihata wenawa.

## Step 3 — Database eka hadanawa
1. Browser eken `http://localhost/phpmyadmin` yanna.
2. Uda **Import** tab eka click karanna.
3. "Choose File" walin `database/schema.sql` file eka select karanna.
4. **Go** click karanna. Eeka `stepz_db` database eka + `products` table eka +
   thiyena 8 products data okkoma insert karayi.

## Step 4 — API eka test karanawa
Browser eke me URL eka open karanna:

```
http://localhost/footwear-ecommerce-main/stepz-api/get_products.php
```

Products 8 JSON widihata pennanawanam, eeka wada karanawa!
(Blank / error ekak awoth, Step 5 mulinma check karanna.)

## Step 5 — app.js eke API_URL eka confirm karanawa
`app.js` uda thiyena me line eka balanna:

```js
const API_URL = 'http://localhost/stepz-api/get_products.php';
```

Ubage folder eka `footwear-ecommerce-main` widihata thiyenawanam, eeka me widihata
change karanna one:

```js
const API_URL = 'http://localhost/footwear-ecommerce-main/stepz-api/get_products.php';
```

## Step 6 — Site eka run karanawa
Option A (recommend): Browser eken kelinma yanna:
```
http://localhost/footwear-ecommerce-main/index.html
```
(Me widihata giyoth CORS issue ekak nathuwa wadak.)

Option B: Kalin widihatama VS Code Live Server eken run karanna. Eeka
Apache eken wenama origin ekakin (`127.0.0.1:5500`) enawa, ithin
`get_products.php` file eke danna CORS header eka (`Access-Control-Allow-Origin: *`)
eeka nisa hariyata wadak wenawa.

## Item ekak add/edit/delete karanna one nam
phpMyAdmin eken `stepz_db` -> `products` table eka open karala, uda ithuru
row ekak Insert karanna, nathnam thiyena row ekak Edit karanna. Website eka
refresh karama ithamin awa data eka pennanawa — code eka wenas karanna one na.

## Files monawada add unne
```
stepz-api/
  db.php              -> MySQL connection settings (host/user/pass/dbname)
  get_products.php    -> Database eken products okkoma JSON widihata denawa
database/
  schema.sql           -> Table eka hadala, kalin hardcode karapu 8 items
                          data widihata insert karanawa
app.js                 -> PRODUCTS array eka empty karala, DOMContentLoaded
                          event eke loadProducts() call karala API eken data
                          gannawa render karanna kalin
```

## Adding new admin panel eka wage ekak passe one nam
Dan thiyena eka "read-only" (products fetch karala pennanawa witharai).
Admin panel ekakin add/edit/delete karanna one nam kiyanna, eeka wenama
PHP files (insert_product.php, update_product.php, delete_product.php)
hadala denna puluwan.
