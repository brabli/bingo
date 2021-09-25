.PHONY: dev
dev:
	@npm run dev

.PHONY: build
build:
	@rm -rf dist/*
	@npm run build