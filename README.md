# mage2postman

![image](https://github.com/cirolosapio/mage2postman/assets/33943143/13ca8bac-d8fe-43d8-b7a2-07f6aeff45e9)

Generate postman collection from Magento

### One line command

```
docker run \
    --interactive \
    --tty \
    --rm \
    --volume $PWD:/app \
    --workdir /app \
    denoland/deno:alpine-1.41.3 \
    run -A \
    "https://raw.githubusercontent.com/cirolosapio/mage2postman/main/main.ts"
```

### Install

```
sudo curl -L https://github.com/cirolosapio/mage2postman/releases/download/v0.0.2/mage2postman -o /usr/local/bin/mage2postman
sudo chmod +x /usr/local/bin/mage2postman
```

in your magento app run

`mage2postman`

or with custom params

`mage2postman --path . --name my-project`
