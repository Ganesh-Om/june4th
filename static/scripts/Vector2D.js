function Vector2D(x=0,y=0){
	this.x=x;
	this.y=y;
}
Vector2D.prototype={
	clone:function(){
		return new Vector2D(this.x,this.y);
	},
	zero:function(){
		this.x=0;
		this.y=0;
		return this;
	},
	isZero:function(){
		return this.x===0 && this.y===0;
	},
	length:null,
	set length(value){
		var a=this.angle;
		this.x=Math.cos(a)*value;
		this.y=Math.sin(a)*value;
	},
	get length(){
		return Math.sqrt(this.lengthSQ);
	},
	lengthSQ:null,
	get lengthSQ(){
		return this.x*this.x+this.y*this.y;
	},
	angle:null,
	set angle(value){
		var len=this.length;
		this.x=Math.cos(value)*len;
		this.y=Math.sin(value)*len;
	},
	get angle(){
		return Math.atan2(this.y,this.x);
	},
	normalize:function(){
		if(this.length===0){
			this.x=1;
			return this;
		}
		var len=this.length;
		this.x/=len;
		this.y/=len;
		return this;
	},
	isNormalized:function(){
		return this.length===1;
	},
	truncate:function(max){
		this.length=Math.min(max,this.length);
		return this;
	},
	reverse:function(){
		this.x*=-1;
		this.y*=-1;
		return this;
	},
	dotProd:function(v2){
		return this.x*v2.x+this.y*v2.y;
	},
	angelBetween:function(v1,v2){
		if(!v1.isNormalized()){v1=v1.clone().normalize();}
		if(!v2.isNormalized()){v2=v2.clone().normalize();}
		return Math.acos(v1.dotProd(v2));
	},
	sign:function(v2){
		return this.prep.dotProd(v2)<0? -1:1;
	},
	prep:null,
	get prep(){
		return new Vector2D(-this.y,this.x);
	},
	dist:function(v2){
		return Math.sqrt(this.distSQ(v2));
	},
	distSQ:function(v2){
		var dx=v2.x-this.x,
			dy=v2.y-this.y;
		return dx*dx+dy*dy;
	},
	add:function(v2){
		return new Vector2D(this.x+v2.x,this.y+v2.y);
	},
	subtract:function(v2){
		return new Vector2D(this.x-v2.x,this.y-v2.y);
	},
	multiply:function(value){
		return new Vector2D(this.x*value,this.y*value);
	},
	divide:function(value){
		return new Vector2D(this.x/value,this.y/value);
	},
	equals:function(v2){
		return this.x===v2.x && this.y===v2.y;
	},
	toString:function(){
		return "[Vector2D(x:"+this.x+",y:"+this.y+")]";
	}
};