# using act to run locally
To run the workflow manually

```
act push --secret-file .secrets -P ubuntu-latest=lucasalt/act_base:latest

## package job
act push --secret-file .secrets -P ubuntu-latest=lucasalt/act_base:latest -j package
```

NOTE: act won't work for the test job since it relies on `services` which [do not work in act yet](https://github.com/nektos/act/issues/173).
