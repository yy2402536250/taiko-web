class Session{
	constructor(touchEnabled){
		this.touchEnabled = touchEnabled
		loader.changePage("session")
		this.endButton = document.getElementById("tutorial-end-button")
		if(touchEnabled){
			document.getElementById("tutorial-outer").classList.add("touch-enabled")
		}
		this.sessionInvite = document.getElementById("session-invite")
		
		pageEvents.add(window, ["mousedown", "touchstart"], this.mouseDown.bind(this))
		pageEvents.keyOnce(this, 27, "down").then(this.onEnd.bind(this))
		
		this.gamepad = new Gamepad({
			"confirm": ["start", "b", "ls", "rs"]
		}, this.onEnd.bind(this))
		
		p2.hashLock = true
		pageEvents.add(p2, "message", response => {
			if(response.type === "invite"){
				this.sessionInvite.innerText = location.origin + location.pathname + "#" + response.value
				p2.hash(response.value)
			}else if(response.type === "songsel"){
				p2.clearMessage("users")
				this.onEnd(false, true)
			}
		})
		p2.send("invite")
	}
	mouseDown(event){
		if(event.target === this.sessionInvite){
			this.sessionInvite.focus()
		}else{
			getSelection().removeAllRanges()
			this.sessionInvite.blur()
		}
		if(event.target === this.endButton){
			this.onEnd()
		}
	}
	onEnd(event, fromP2){
		if(!p2.session){
			p2.send("leave")
			p2.hash("")
			p2.hashLock = false
		}else if(!fromP2){
			return p2.send("songsel")
		}
		if(event && event.type === "keydown"){
			event.preventDefault()
		}
		this.clean()
		assets.sounds["don"].play()
		setTimeout(() => {
			new SongSelect(false, false, this.touchEnabled)
		}, 500)
	}
	clean(){
		this.gamepad.clean()
		pageEvents.remove(window, ["mousedown", "touchstart"])
		pageEvents.keyRemove(this, 27)
		pageEvents.remove(p2, "message")
		delete this.endButton
		delete this.sessionInvite
	}
}
