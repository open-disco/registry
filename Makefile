.DEFAULT_GOAL := help
.PHONY: help build clean down logs rerun restart run start stop

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-z0-9A-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Prepare a development image to run
	docker build . -t open-disco

clean: ## Stop, remove all containers, and remove all images built by docker-compose
	docker-compose down -v --rmi local

down: ## Stop and remove all containers started by docker-compose
	docker-compose down

rerun: down run ## Stop, rebuild, and run the local environment in the foreground

restart: down start ## Stop and rebuild everything and run the stack.

run: ## Run the local environment in the foreground for debugging
	docker-compose up

start: ## Bring up all containers started by the docker-compose
	docker-compose up -d

stop: ## Stop all containers started by docker-compose
	docker-compose stop

logs: ## Display logs, optionally tail by providing 't={number_of_lines}' argument
	@if [ ${t} ]; then \
		docker-compose logs -tf default --tail=${t}; \
	else \
		docker-compose logs -tf default; \
	fi

