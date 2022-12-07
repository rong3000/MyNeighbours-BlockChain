const equal = (obj1, obj2, keyNames) => {
    if (!obj1 && !obj2) {
        return true;
    }

    if (Object.keys(obj1).length != Object.keys(obj2).length) {
        return false;
    }

    return !(keyNames.map(keyName => obj1[keyName] == obj2[keyName]).some(isEqual => !isEqual));
}

const groupBy = (records, keyNames) => {
    const groups = [];

    records.forEach(function (record) {
        const key = keyNames.reduce(function (obj, keyName) {
          if (keyName in record) // line can be removed to make it inclusive
            obj[keyName] = record[keyName];
          return obj;
        }, {});

        let group = groups.find(group => equal(group.key, key, keyNames));
        if (!group) {
            group = {
                key: key,
                value: [record]
            };

            groups.push(group);
        }
        else {
            group.value = [...group.value, record];
        }
    });

    return groups;
}

export default groupBy;