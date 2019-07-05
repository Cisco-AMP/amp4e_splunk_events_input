# Cisco AMP for Endpoints Events Input

## Prerequisites

* docker
* docker-compose

## Usage

```bash
docker-compose up --build
```

access Splunk at [http://localhost:8000](http://localhost:8000)

## Configure splunkd to use your HTTP Proxy Server

In `$SPLUNK_HOME/etc/system/local/server.conf` (or any other applicable location, if you are using a deployment server),
make the following changes to the `[proxyConfig]` stanza:

```conf
[proxyConfig]
http_proxy = <string that identifies the server proxy. When set, splunkd sends all HTTP requests through
this proxy server. The default value is unset.>
https_proxy = <string that identifies the server proxy. When set, splunkd sends all HTTPS requests
through the proxy server defined here. If not set, splunkd uses the proxy defined in http_proxy. The
default value is unset.>
no_proxy = <string that identifies the no proxy rules. When set, splunkd uses the [no_proxy] rules to
decide whether the proxy server needs to be bypassed for matching hosts and IP Addresses. Requests going
to localhost/loopback address are not proxied. Default is "localhost, 127.0.0.1, ::1">
```

You can also configure proxies by setting the environment variables `HTTP_PROXY` and `HTTPS_PROXY`.

## Configure Splunk Web to use the key and certificate files

In `$SPLUNK_HOME/etc/system/local/web.conf` (or any other applicable location, if you are using a deployment server),
make the following changes to the `[settings]` stanza:

```conf
[settings]
enableSplunkWebSSL = true
privKeyPath = </home/etc/auth/mycerts/mySplunkWebPrivateKey.key >
Absolute paths may be used. non-absolute paths are relative to $SPLUNK_HOME

serverCert = </home/etc/auth/mycerts/mySplunkWebCertificate.pem >
Absolute paths may be used. non-absolute paths are relative to $SPLUNK_HOME
```

You can also configure certificate by setting the environment variable `SSL_CERT_FILE`.

## Nuances

Docker complains of an upgrade during startup. This is because the initial Splunk setup initializes some databases.
Remove the container and start again.

```bash
docker-compose down
docker-compose up
```

* The changes in input app require the Splunk to be restarted. When you have made some changes, restart Splunk: `docker-compose exec splunk /opt/splunk/bin/splunk restart`
* Do not push your *local* folder to git repository, as it stores values that belong to your unique Splunk instance.
* If you need to add a python library dependency - enter its name within the *bin/requirements-splunk.txt* and run `pip install -r bin/requirements-splunk.txt --target=$SPLUNK_HOME/lib/python2.7/site-packages`.
* By default, Splunk will display 2 info messages about version updates when you reach its dashboard for the first time. If you see other messages (warnings or errors) - you most certainly need to fix your input app to make them disappear.
* To perform a command within splunk python interpreter, run it with splunk cmd python, e.g.: `splunk cmd python amp4e_events_input.py --scheme`

## Testing

* Enter your admin credentials in test/support/config.py
* To execute all tests, `docker-compose exec -u  splunk /opt/splunk/bin/splunk cmd python -m unittest discover`.
* If you'd like to run a single test, refer to it as to a module:
    `docker-compose exec -u splunk splunk /opt/splunk/bin/splunk cmd python -m unittest test.amp4e_events_input.test_stream_dict_manager`
* When testing upgrading the app, you can uncomment the `splun-test` container in docker-compose.yml. This will provide you with a fresh Splunk install to test installation/upgrading on.

## Diag

If a customer is having issues with the app, you should consider providing an output of diag script to authorized Cisco
representative:

```bash
splunk login
splunk diag --collect app:amp4e_events_input
```

The script will result in a *.tar.gz file, which will contain data that will greatly help us figure out your issue. These data will include sensitive information about your Splunk instance, so please **make sure you provide it ONLY to authorized Cisco representative**

## Release

### General instructions

Whenever a new release is made, please keep in mind that default/app.conf should be updated accordingly - *build* attribute of the `[install]` stanza and *version* attribute of the `[launcher]` stanza must be changed if needed. The *build* specifies the assets version in order to know when to expire the browser cache. It should be an integer, which you increment after you change something in app/static before release, as per Splunk's recommendations. The *version* is a version string, constructed according to [semver recommendations](https://semver.org/).

### Gotchas

When installing or upgrading the app, Splunk simply copies all the files from the package provided into /`opt/splunk/etc/apps/<your_package_name>`. This means that if a file or folder is deleted in a newer version of the app, when a user upgrades their app, that file will remain. It needs to be called out specifically in the upgrade process documentation that the user will need to delete it from their Splunk server.

If a **new folder is added at the top level of the app**, it's name must be added to `DIRS_TO_ARCHIVE` in `release/util/splunkbase_releaser.py` to be included in the release package.

### Splunkbase release

Creates a package for release on Splunkbase.

```bash
docker-compose exec splunk sh -c "cd release;fab splunkbase_release"
```

## Known Issues

### Errors

```bash
ValueError: Expected instance of Parameters, not <URLParameters host=export-streaming.amp.cisco.com port=443 virtual_host=/ ssl=True>
```

* This error occurs when two instances of the Pika library are included in your installation. If you encounter this error, check to see if the folder `/opt/splunk/etc/apps/amp4e_events_input/bin/pika/pika` exists on your Splunk server. If it does, remove it with:

    ```bash
    $ rm -rf /opt/splunk/etc/apps/amp4e_events_input/bin/pika/pika
    ```
