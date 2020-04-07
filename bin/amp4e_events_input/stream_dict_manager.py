import re


# Transforms the stream data for API parameters and back, checks for diffs between stream data hashes
class StreamDictManager:
    KEYS_FOR_STORAGE = ['stream_name', 'groups', 'event_types', 'index', 'api_host']

    def __init__(self, incoming_dict):
        self.incoming_dict = incoming_dict.copy()
        if 'name' in self.incoming_dict:
            del self.incoming_dict['name']
        self.result = None

    def for_api(self):
        self.result = {}
        name = self.incoming_dict.get('stream_name')
        groups = self.incoming_dict.get('groups')
        event_types = self.incoming_dict.get('event_types')
        # name cannot be None, as this field is required
        if name is not None:
            self.result['name'] = name
        if groups is not None:
            if len(groups) == 0:
                self.result['group_guid'] = []
            else:
                self.result['group_guid'] = re.split(r'\s*,\s*', groups)

        if event_types is not None:
            if len(event_types) == 0:
                self.result['event_type'] = []
            else:
                self.result['event_type'] = re.split(r'\s*,\s*', event_types)
        return self.result

    # merges incoming_dict with other for all keys in other that are within self.KEYS_FOR_STORAGE
    def merged_with(self, other):
        self.result = self.incoming_dict.copy()
        self.result.update({k: v for k, v in other.items() if k in self.KEYS_FOR_STORAGE})
        return self.result

    # returns those fields of other that are different from incoming dict
    def diff_fields_from(self, other):
        return {k: v for k, v in other.items()
                if k in self.KEYS_FOR_STORAGE and self.incoming_dict.get(k) != other.get(k)}
