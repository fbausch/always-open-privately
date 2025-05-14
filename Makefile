all: clean build
clean:
	rm always-open-privately.zip
build:
	cd add-on; zip -r ../always-open-privately.zip ./*

