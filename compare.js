// read in and parse services.json

var fs = require('fs');
var RandExp = require('randexp');

var services = JSON.parse(fs.readFileSync('services.json', 'utf8'));
var content_rule_list = JSON.parse(fs.readFileSync('ContentRuleList.json', 'utf8'));

/* services.json looks like this:
{
  "license": "Copyright 2010-2024 Disconnect, Inc. / Licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license (the “License”). A summary of the License is available here: https://creativecommons.org/licenses/by-nc-sa/4.0/. The text version of the License is here: https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.txt. Please see the License for the specific language governing permissions and limitations under the License. Unless agreed to in writing or required by law, software distributed under the License on an \"as is\" basis without warranties or conditions of any kind, either express or implied. This license does not apply to any Disconnect logos or marks contained in this repo.",
  "categories": {
    "Email": [
      {
        "10Web": {
          "https://10web.io/": [
            "10web.io"
          ]
        }
      },
      {
        "4dem": {
          "4dem.it": [
            "4dem.it"
          ]
        }
      },
      {
        "8d8.biz": {
          "https://8d8.biz": [
            "8d8.biz"
          ]
        }
      },
...
*/

/* ContentRuleList.json looks like:
[
  {
    "trigger" : {
      "resource-type" : [
        "document"
      ],
      "url-filter" : "^[^:]+:\/\/+([^:\/]+\\.)?1dmp\\.io\\\/supersync",
      "url-filter-is-case-sensitive" : 1,
      "load-context" : [
        "child-frame"
      ],
      "load-type" : [
        "third-party"
      ]
    },
    "action" : {
      "type" : "block"
    }
  },
  {
    "trigger" : {
      "resource-type" : [
        "document"
      ],
      "url-filter" : "^[^:]+:\/\/+([^:\/]+\\.)?acuityplatform\\.com\\\/Adserver\\\/.+",
      "url-filter-is-case-sensitive" : 1,
      "load-context" : [
        "child-frame"
      ],
      "load-type" : [
        "third-party"
      ]
    },
    "action" : {
      "type" : "block"
    }
  },
...
*/

var domains = {};

for (var category in services.categories) {
    for (var service in services.categories[category]) {
        for (var entity in services.categories[category][service]) {
            for (var product in services.categories[category][service][entity]) {
                if (services.categories[category][service][entity][product] instanceof Array) {
                    for (var domain of services.categories[category][service][entity][product]) {
                        //console.log("   ", domain);
                        domains[domain] = {"category": category,}
                    }
                }
            }
        }
    }
}
console.log("# Comparison of Safari's content blocking list and Disconnect's services.json\n");

console.log("## Urls not blocked by Disconnect's services.json");
console.log("```")

for (var rule of content_rule_list) {
    var url_filter = rule.trigger['url-filter'];
    //if (url_filter.startsWith("^[^:]+://+([^:/]+\.)?")) {
    if (url_filter.startsWith("^[^:]+://+([^:/]+\\.)?")) {
        // chop off the beginning of the regex
        url_filter = url_filter.slice(21);
        url_filter = "https://" + url_filter;
    }
    var example = new RandExp(new RegExp(url_filter)).gen();
    var url = new URL(example);
    //console.log(url.hostname, example);
    // check if hostname is in domains
    if (url.hostname in domains) {
        domains[url.hostname].blocked = true;
    } else {
        console.log("    ", example);
    }
}
console.log("```")


console.log("\n## URLs from Safari's ContentRuleList.json blocked by Disconnect's services.json");
console.log("```")
for (var category in services.categories) {
    console.log(category);

    for (var service in services.categories[category]) {
        for (var entity in services.categories[category][service]) {
            for (var product in services.categories[category][service][entity]) {
                if (services.categories[category][service][entity][product] instanceof Array) {
                    for (var domain of services.categories[category][service][entity][product]) {
                        //console.log("   ", domain, domains[domain].blocked);
                        if (domains[domain].blocked) {
                            console.log("    ", domain);
                        }
                    }
                }
            }
        }
    }
}
console.log("```")

console.log("\n## Domains in Disconnect's services.json not blocked by Safari's ContentRuleList.json");
console.log("```")

for (var category in services.categories) {
    console.log(category);

    for (var service in services.categories[category]) {
        for (var entity in services.categories[category][service]) {
            for (var product in services.categories[category][service][entity]) {
                if (services.categories[category][service][entity][product] instanceof Array) {
                    for (var domain of services.categories[category][service][entity][product]) {
                        //console.log("   ", domain, domains[domain].blocked);
                        if (!domains[domain].blocked) {
                            console.log("    ", domain);
                        }
                    }
                }
            }
        }
    }
}
console.log("```")







