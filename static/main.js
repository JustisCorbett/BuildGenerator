
async function getVersionData() {
    // get patch version for correct irem info
    let response = await fetch ("https://ddragon.leagueoflegends.com/api/versions.json")
    if (response.ok) {
        const versionData = await response.json();
        return versionData[0];
    } else {
        alert("Could not get patch data. Refresh to try again.");
    }
}

function randNum (max) {
    let rand = (Math.floor(Math.random() * max));
    return rand;
}

async function getChampData () {
    let response = await fetch ("https://ddragon.leagueoflegends.com/cdn/" + version + "/data/en_US/champion.json");
    if (response.ok) {
        const champData = await response.json();
        return champData.data;
    } else {
        alert("Could not get champion data. Refresh to try again.");
    }
}

function renderChampData (champ) {
    let imageLink = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champ.id + "_0.jpg";
    splash = document.getElementById("champ-splash");
    splash.src = imageLink;
    let champNameEl = document.getElementById("champion-name");
    let champTitleEl = document.getElementById("champion-title");
    champNameEl.textContent = champ.name;
    champTitleEl.textContent = champ.title;
}

async function randChamp (champName) {
    if (champName !== undefined && champName !== "") {
        return getChampData().then(champData => {
            let champArray = Object.values(champData);
            let champ = champArray.find(champ => champ.name === champName);
            return champ;
        });
    } else {
        return getChampData().then(champData => {
            let rand = randNum(Object.keys(champData).length);
            let champArray = Object.values(champData);
            let champ = champArray[rand];
            let champNames = champArray.map(champ => {
                return champ.name;
            })
            createSearch(champNames);
            return champ;
        });
    };  
}

async function getItemData () {
    let response = await fetch ("https://ddragon.leagueoflegends.com/cdn/" + version + "/data/en_US/item.json");
    let tags = [];
    if (response.ok) {
        const itemData = await response.json();
        let itemArray = Object.values(itemData.data);
        //filter for actual buildable items
        let filteredItemArray = itemArray.filter(item =>
            (item.hasOwnProperty("requiredAlly") === false) &&
            (item.hasOwnProperty("requiredChampion") === false) &&
            (item.maps[11] == true) &&
            (item.hasOwnProperty("inStore") === false) &&
            (item.tags.includes("Consumable") === false) &&
            (item.tags.includes("Trinket") === false) &&
            (item.tags.includes("Lane") === false) &&
            (item.tags.includes("Jungle") === false)
        );
        filteredItemArray.forEach(item => {
            item.tags.forEach(tag => {
                if (tag != "Boots")
                tags.push(tag);
            });
        });
        let items = {items: [], uniqueTags: []};
        items.uniqueTags = [...new Set(tags)];
        //filter for mythic items
        items.items.mythic = filteredItemArray.filter(item => 
            (item.description.indexOf("Mythic") !== -1)
            );
        //filter for legendary items
        items.items.normal = filteredItemArray.filter(item => 
            (item.hasOwnProperty("into") === false) &&
            (item.tags.includes("Boots") === false) &&
            (item.description.indexOf("Mythic") === -1)
            );
        //filter for boots
        items.items.boots = filteredItemArray.filter(item => 
            (item.hasOwnProperty("into") === false) &&
            (item.tags.includes("Boots")));
        return items;
    } else { 
        alert("Could not get Item data. Refresh to try again.")
    }
}

function countTags (arr1, arr2) {
    let count = 0;
    for (let i = 0; i < arr1.length; i++) {
        for (let j = 0; j < arr2.length; j++) {
            if (arr1[i] === arr2[j]) {
                count = count + 1;
            }
        }
    }
    return count;
}

//prevent unique passive stacking
function checkPassives (uniquePassives, itemDesc) {
    if (itemDesc.indexOf("<passive>") !== -1) {
        console.log(itemDesc)
        let result = itemDesc.match(/\<passive\>[a-zA-Z ']*\:/g);
        console.log("result " + result)
        result.forEach(passive => 
            uniquePassives.forEach(itemPassive => {
                if (passive === itemPassive) {
                    return false;
                }
            }))
    } else {
        return true;
    }
}

function randBuild (champ, items, uniqueTags) {
    uniqueTags = [...uniqueTags];
    let tags = [];
    let mythicTags = [];
    let build = [];
    let rand = 0;
    let count = 0;
    //check if champ uses mana to prevent unusable items
    if (champ.partype !== "Mana") {
        items.mythic = items.mythic.filter(item => (item.tags.includes("Mana") === false));
        items.normal = items.normal.filter(item =>
            (item.tags.includes("Mana") === false) &&
            (item.tags.includes("ManaRegen") === false)
        );
        uniqueTags.filter(tag =>
            (tag != "Mana") &&
            (tag != "ManaRegen")
        );
    };
    for (let i = 0; i < 3; i++) {
        do {
            rand = randNum(uniqueTags.length);
        } while (tags.includes(uniqueTags[rand]))
        tags.push(uniqueTags[rand]);
    }
    for (let i = 0; i < 6; i++) {
        if (i === 0) {
            // get a random mythic item and get tags from it to find synergistic legendary items
            do {
                rand = randNum(items.mythic.length);
            } while (items.mythic[rand].tags.some(tag => tags.includes(tag)) === false)
            build.push(items.mythic[rand]);
            filtMythicTags = items.mythic[rand].tags.filter(tag => 
                (tag !== "Active") &&
                (tag !== "NonBootsMovement") &&
                (tag !== "Stealth")
            );
            if (items.mythic[rand].name == "Eclipse") {
                mythicTags = filtMythicTags.slice(0, 4);
            } else {
                mythicTags = filtMythicTags.slice(0, 3);
            }
        } else if (i === 1) {
            if (filtMythicTags.some(tag => items.boots.some(boot => {
                return boot.tags.includes(tag)
            }))) {
                do {
                    rand = randNum(items.boots.length);
                } while (items.boots[rand].tags.some(tag => filtMythicTags.includes(tag)) === false)
                build.push(items.boots[rand]);
            } else {
                let rand = randNum(items.boots.length);
                build.push(items.boots[rand]);
            }
        } else {
            let counter = 0;
            let uniquePassives = []
            //TODO: check for unique passive clashes
            do {
                counter += 1;
                rand = randNum(items.normal.length);
                count = countTags(mythicTags, items.normal[rand].tags)
                passiveCount = checkPassives(uniquePassives, items.normal[rand].description)
                console.log("passive count" + passiveCount)
                if (counter > 2000 && build.includes(items.normal[rand]) === false) {
                    break;
                }
            } while (
                build.includes(items.normal[rand]) === true ||
                (count < 2) === true ||
                (((count < 1) === true) && ((counter < 1000) === true))
            )
            // check for unique passives and add them to list of unique passives to check new items against
            if (items.normal[rand].description.indexOf("<passive>") !== -1) {
                console.log("unique passives found")
                let result = items.normal[rand].description.match(/\<passive\>[a-zA-Z ']*\:/g);
                
                result.forEach(match => uniquePassives.push(match))
            }
            build.push(items.normal[rand]);
        };
    };
    return {
        items: build,
        tags: mythicTags
    };
}

//render item elements
function renderBuildData(build) {
    let oldEls = document.querySelectorAll(".item:not(.hidden)");
    if(oldEls) {
        oldEls.forEach(el => el.remove());
    }
    let blankEl = document.querySelectorAll(".item");
    build.items.forEach(item => {
        let clonedEl = blankEl[0].cloneNode(true);
        if (clonedEl.classList.contains("hidden")) {
            clonedEl.classList.remove("hidden");
        }
        let clonedChildren = clonedEl.children;
        for (i = 0; i < clonedChildren.length; i++) {
            if (clonedChildren[i].classList.contains("item-image")) {
                clonedChildren[i].src = "https://ddragon.leagueoflegends.com/cdn/"+ version +"/img/item/" + item.image.full;
            }
            if (clonedChildren[i].classList.contains("tooltip-text")) {
                clonedChildren[i].innerHTML = "<h2>" + item.name + "</h2>" + item.description + "<h4><gold>" + "Cost: " + item.gold.total + "</gold></h4>";
            }
        }
        document.getElementById("item-container").appendChild(clonedEl);
    });
}

async function createBuild (champName) {
    version = await getVersionData();
    let champ = await randChamp(champName);
    renderChampData(champ);
    let items = await getItemData();
    build = randBuild(champ, items.items, items.uniqueTags);
    renderBuildData(build);
}

function createSearch (champNames) {
    const autoCompleteJS = new autoComplete({
        placeHolder: "Search for Champion...",
        data: {
            src: champNames
        },
        resultsList: {
            element: (list, data) => {
                if (!data.results.length) {
                    // Create "No Results" message element
                    const message = document.createElement("div");
                    // Add class to the created element
                    message.setAttribute("class", "no_result");
                    // Add message text content
                    message.innerHTML = `<span>Found No Results for "${data.query}"</span>`;
                    // Append message element to the results list
                    list.prepend(message);
                }
            },
            noResults: true,
        },
        resultItem: {
            highlight: true
        },
        events: {
            input: {
                selection: (event) => {
                    const selection = event.detail.selection.value;
                    autoCompleteJS.input.value = selection;
                }
            }
        }
    });
}

window.onload = () => {
    createBuild();
    document.getElementById("reroll").onclick = function () {
        let champ = document.getElementById("autoComplete").value;
        createBuild(champ);
    };
}