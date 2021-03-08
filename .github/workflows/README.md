To run the workflow manually

```
act push --secret-file .secrets -P ubuntu-latest=lucasalt/act_base:latest
```

NOTE: act won't work for testing since job `services` [do not work in act yet](https://github.com/nektos/act/issues/173).
