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
        let rand = (Math.floor(Math.random() * Object.keys(champData).length));
        let champArray = Object.values(champData);
        let champ = champArray[rand];
        return champ;
    });
}

async function getItemData () {
    let response = await fetch ("http://ddragon.leagueoflegends.com/cdn/11.12.1/data/en_US/item.json");
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
        let items = {};
        items.mythic = filteredItemArray.filter(item => item.hasOwnProperty("into"));
        items.normal = filteredItemArray.filter(item => item.hasOwnProperty("into") === false);
        return items;
    } else { 
        alert("Could not get Item data. Refresh to try again.")
    }
}

function randBuild (champ, items) {
    let build = [];
    if (champ.partype !== "Mana") {
        items.mythic = items.mythic.filter(item => (item.tags.includes("Mana") === false));
        items.normal = items.normal.filter(item =>
             (item.tags.includes("Mana") === false) &&
             (item.tags.includes("ManaRegen") === false)
             );
    };
    for (i = 0; i < 6; i++) {
        console.log(i);
        if (i === 0) {
            let rand = (Math.floor(Math.random() * items.mythic.length))
            build.push(items.mythic[rand]);
        } else {
            let rand = (Math.floor(Math.random() * items.normal.length))
            build.push(items.normal[rand]);
        };
    };
    return build;
}

function renderBuildData(build) {
    let blankEl = document.getElementsByClassName("item");
    build.forEach(item => {
        let clonedEl = blankEl[0].cloneNode(true);
        console.log(clonedEl);
        let clonedChildren = clonedEl.children;
        console.log(clonedEl.children)
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
    build = randBuild(champ, items);
    console.log(build);
    renderBuildData(build);
}

window.onload = () => {
    createBuild();
}