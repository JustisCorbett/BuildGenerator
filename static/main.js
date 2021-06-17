function randNum (max) {
    let rand = (Math.floor(Math.random() * max));
    return rand;
}

async function getChampData () {
    let response = await fetch ("http://ddragon.leagueoflegends.com/cdn/11.11.1/data/en_US/champion.json");
    if (response.ok) {
        const champData = await response.json();
        return champData.data;
    } else {
        alert("Could not get champion data. Refresh to try again.");
    }
}

function renderChampData (champ) {
    let imageLink = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champ.id + "_0.jpg";
    splash = document.getElementById("champ-splash");
    splash.src = imageLink;
    console.log(imageLink);
    let champNameEl = document.getElementById("champion-name");
    let champTitleEl = document.getElementById("champion-title");
    champNameEl.textContent = champ.name;
    champTitleEl.textContent = champ.title;
}

async function randChamp () {
    return getChampData().then(champData => {
        let rand = randNum(Object.keys(champData).length);
        let champArray = Object.values(champData);
        let champ = champArray[rand];
        return champ;
    });
}

async function getItemData () {
    let response = await fetch ("http://ddragon.leagueoflegends.com/cdn/11.12.1/data/en_US/item.json");
    let tags = [];
    if (response.ok) {
        const itemData = await response.json();
        let itemArray = Object.values(itemData.data);
        let filteredItemArray = itemArray.filter(item =>
            (item.hasOwnProperty("requiredAlly") === false) &&
            (item.hasOwnProperty("requiredChampion") === false) &&
            (item.maps[11] == true) &&
            (item.hasOwnProperty("inStore") === false) &&
            (item.tags.includes("Consumable") === false) &&
            (item.tags.includes("Trinket") === false) &&
            ((item.hasOwnProperty("into") === false) || (item.into[0] >= 7000)) &&
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
        items.items.mythic = filteredItemArray.filter(item => item.hasOwnProperty("into"));
        items.items.normal = filteredItemArray.filter(item => 
            (item.hasOwnProperty("into") === false) &&
            (item.tags.includes("Boots") === false)
            );
        items.items.boots = filteredItemArray.filter(item => item.tags.includes("Boots"));
        // let filteredTags = {
        //     attack: ["Damage", "AttackSpeed", "CriticalStrike", "ArmorPenetration", "Lifesteal"],
        //     defense: ["Health", "Armor", "HealthRegen", "SpellBlock"],
        //     magic: ["SpellDamage", "MagicPenetration", "SpellVamp", "OnHit"]
        // }
        return items;
    } else { 
        alert("Could not get Item data. Refresh to try again.")
    }
}

function randBuild (champ, items, uniqueTags) {
    uniqueTags = [...uniqueTags];
    let tags = [];
    let mythicTags = [];
    let bootTags = [];
    let build = [];
    let rand = 0;
    if (champ.partype !== "Mana") {
        items.mythic = items.mythic.filter(item => (item.tags.includes("Mana") === false));
        items.normal = items.normal.filter(item =>
            (item.tags.includes("Mana") === false) &&
            (item.tags.includes("ManaRegen") === false)
        );
        console.log(uniqueTags);
        uniqueTags.filter(tag =>
            (tag != "Mana") &&
            (tag != "ManaRegen")
        );
    };
    for (i = 0; i < 3; i++) {
        do {
            rand = randNum(uniqueTags.length);
        } while (tags.includes(uniqueTags[rand]))
        tags.push(uniqueTags[rand]);
    }
    for (i = 0; i < 6; i++) {
        if (i === 0) {
            //if (items.mythic.forEach())
            do {
                rand = randNum(items.mythic.length);
            } while (items.mythic[rand].tags.some(tag => tags.includes(tag)) === false)
            build.push(items.mythic[rand]);
            mythicTags = items.mythic[rand].tags;
            if (mythicTags.includes("Active") || mythicTags.includes("NonBootsMovement")) {
                mythicTags.filter(tag => 
                    (tag != "Active") ||
                    (tag != "NonBootsMovement")
                );
            }
            console.log(mythicTags);
        } else if (i === 1) {
            items.boots.forEach(boot => {
                bootTags.push(boot.tags);
            })
            if (mythicTags.some(tag => bootTags.includes(tag))) {
                do {
                    rand = randNum(items.boots.length);
                } while (items.boots[rand].tags.some(tag => mythicTags.includes(tag)) === false)
                build.push(items.boots[rand]);
            } else {
                let rand = randNum(items.boots.length);
                build.push(items.boots[rand]);
            }
        } else {
            do {
                rand = randNum(items.normal.length);
            } while (build.includes(items.normal[rand]) || items.normal[rand].tags.some(tag => mythicTags.includes(tag)) === false)
            build.push(items.normal[rand]);
        };
    };
    console.log(tags)
    return build;
}

function renderBuildData(build) {
    let blankEl = document.getElementsByClassName("item");
    build.forEach(item => {
        let clonedEl = blankEl[0].cloneNode(true);
        let clonedChildren = clonedEl.children;
        for (i = 0; i < clonedChildren.length; i++) {
            if (clonedChildren[i].classList.contains("item-image")) {
                clonedChildren[i].src = "http://ddragon.leagueoflegends.com/cdn/11.12.1/img/item/" + item.image.full;
            }
        }
        document.getElementById("item-container").appendChild(clonedEl);
    });
}

async function createBuild () {
    let champ = await randChamp();
    console.log(champ);
    renderChampData(champ);
    let items = await getItemData();
    console.log(items);
    build = randBuild(champ, items.items, items.uniqueTags);
    console.log(build);
    renderBuildData(build);
}

window.onload = () => {
    createBuild();
}