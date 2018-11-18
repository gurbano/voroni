

export default class RNG {
  m: number;
  a: number;
  c: number;
  state: any;

  constructor(seed: any){
    if (Object.prototype.toString.call(seed) === "[object String]"){
      // console.log('string seed');
      seed = this.hashCode(seed);
    }
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }
  hashCode = (s: string) => {
    var hash = 0, i, chr;
    if (s.length === 0) return hash;
    for (i = 0; i < s.length; i++) {
      chr   = s.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  nextInt = (): number => {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }
  nextFloat = (): number => {
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
  }
  nextRange = (start: number, end: number) : number => {
    if (start > end){
      return this.nextRange(end, start);
    }
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    var rangeSize = end - start;
    var randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
  }
  choice = (array: Array<any>): any => {
    return array[this.nextRange(0, array.length)];
  } 
}