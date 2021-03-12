
- [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [Managing Safari Web Extension Permissions](https://developer.apple.com/documentation/safariservices/safari_web_extensions/managing_safari_web_extension_permissions)


Developing the app
--

Generate extension files with
```sh
npm run build:safari
```

Then copy generated files into the project
```sh
cp -r dist/build/safari/* 'platform/safari/app/Latynka Extension/Resources/'
```
