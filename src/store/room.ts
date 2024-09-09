import { makeAutoObservable } from "mobx";

class RoomStore {
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  userId: string | null = null;
  room: number | null = null;
  isJoined: boolean = false

  constructor() {
    makeAutoObservable(this);
  }

  setLocalStream(track: MediaStreamTrack) {
    if (!this.localStream) {
      this.localStream = new MediaStream();
    }
    this.localStream.addTrack(track);
  }

  setRemoteStream(track: MediaStreamTrack) {
    if (!this.remoteStream) {
      this.remoteStream = new MediaStream();
    }

    this.remoteStream.addTrack(track);
    if(!this.remoteStream.active) {
      this.removeRemoteStream()
    }
  }

  setIsJoined(bool: boolean) {
    this.isJoined = bool
  }

  removeRemoteStream() {
    this.remoteStream = null;
  }

  clearStreams() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.remoteStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
    this.removeRemoteStream()
  }
}

export const roomStore = new RoomStore();
