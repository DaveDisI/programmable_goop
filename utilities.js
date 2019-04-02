function xorshift(x)
{
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    return x;
}

function absoluteValue(v){
    if(v >= 0){
        return v;
    }
    return -v;
}