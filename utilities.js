function xorshift(x){
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    return x;
}

function absoluteValue(v){
    return v >= 0 ? v : -v;
}
