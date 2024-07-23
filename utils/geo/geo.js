

function getLinearDistance(latA,lonA,latB,lonB){
    if(latA && lonA && latB && lonB){
        latA = parseFloat(latA);
        latB = parseFloat(latB);
        lonA = parseFloat(lonA);
        lonB = parseFloat(lonB);
        let theta = lonA -lonB;
        let distance = 60*1.1515*(180/Math.PI)*
            Math.acos(
                Math.sin(latA * (Math.PI / 180))*
                Math.sin(latB * (Math.PI / 180))+
                Math.cos(latA * (Math.PI / 180))*
                Math.cos(latB * (Math.PI / 180))*
                Math.cos(theta * (Math.PI / 180))
            );
        return parseFloat(distance*1.609344).toFixed(1);
    }else return null
    
}



module.exports = {
    getLinearDistance
}