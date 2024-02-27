set dotenv-load := false

venv_path := justfile_directory() + "/.venv"
venv_script := venv_path + "/bin/activate"

dev:
	cd frontend && node_modules/.bin/vite

build:
	cd frontend && node_modules/.bin/vite build

serve:
	go run main.go

dev-bundle:
	just build && just serve
