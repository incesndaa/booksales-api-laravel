<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book&Co.</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="{{ config('midtrans.client_key') }}">
    </script>
</head>
<body>
    <div id="app"></div>
</body>
</html>
