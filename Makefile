dev:
	 rm -r -f  frontend/dist/* && sh -c "make build & make comp & make serve"

build:
	./node_modules/.bin/rollup -c rollup.config.js --configDev -w

comp:
	./node_modules/.bin/rollup -c rollup.config.js --configComp -w

serve:
	uvicorn backend.main:app --reload

test:
	python -m pytest
