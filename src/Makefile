
.PHONY: all debug
all: ../js/v1.js ../js/v1-min.js
debug: ../js/v1.js


../js/v1.js: sharer.js v1.js
	npx browserify v1.js -o ../js/v1.js

../js/v1-min.js: sharer.js v1.js
	npx browserify -t uglifyify v1.js | npx uglifyjs > ../js/v1-min.js


.PHONY: clean
clean:
	-rm ../js/v1.js ../js/v1-min.js
