// store/janus.ts\

/*eslint-disable*/

import Janus, { JanusJS } from "janus-gateway";
import { makeAutoObservable } from "mobx";
import adapter from "webrtc-adapter";
import { roomStore } from "./room";

class JanusStore {
  janus: Janus | null = null;
  mainHandle: JanusJS.PluginHandle | null = null;
  remoteListPluginHandle: Record<number, JanusJS.PluginHandle> = {};

  constructor() {
    makeAutoObservable(this);
  }

  handleRemotePublishers(publishers: { id: number }[]) {
    publishers.forEach((publisher) => {
      this.attachRemoteFeed(publisher.id);
    });
  }

  attachRemoteFeed(feedId: number) {
    let remoteFeed: JanusJS.PluginHandle | null = null;

    this.janus?.attach({
      plugin: "janus.plugin.videoroom",
      success: (pluginHandle) => {
        remoteFeed = pluginHandle;
        const listenRequest = { request: "join", room: roomStore.room, ptype: "subscriber", feed: feedId };
        remoteFeed?.send({ message: listenRequest });
      },
      error: () => {
      },
      onmessage: (message, jsep) => {
        if (jsep) {
          remoteFeed?.createAnswer({
            jsep: jsep,
            media: { audioSend: false, videoSend: false },
            success: (jsep) => {
              const body = { request: "start", room: roomStore.room };
              remoteFeed?.send({ message: body, jsep: jsep });
            },
            error: () => {},
          });
        }
      },
      onremotetrack: (track) => {
        roomStore.setRemoteStream(track);
        this.remoteListPluginHandle[feedId] = remoteFeed!;
      },
      oncleanup: () => {
        roomStore.removeRemoteStream();
        if (remoteFeed) {
          delete this.remoteListPluginHandle[feedId];
        }
      },
    });
  }

  onMessage(message: JanusJS.Message, jsep?: JanusJS.JSEP) {
    const event = message.videoroom;
    if (event === "joined") {
      roomStore.userId = message.id;
      if (message.publishers) {
        this.handleRemotePublishers(message.publishers);
      }
    }

    if (event === "event" && message.publishers) {
      this.handleRemotePublishers(message.publishers);
    }

    if (message.leaving || message.unpublished) {
      const leavingId = message.leaving || message.unpublished;
      roomStore.removeRemoteStream();
    }

    if (jsep) {
      this.mainHandle?.handleRemoteJsep({ jsep });
    }
  }

  leave() {
    const request = {request: 'leave'}

    this.mainHandle?.send({message: request})
  }

  attach(callback?: Function) {
    if(this.mainHandle) {
      callback?.()
      return
    }

    this.janus?.attach({
      plugin: "janus.plugin.videoroom",
      success: (pluginHandle) => {
        this.mainHandle = pluginHandle;
        callback?.()
      },
      error: () => {},
      onmessage: (message, jsep) => {
        this.onMessage(message, jsep);
      },
      onlocaltrack: (track) => {
        roomStore.setLocalStream(track);
      },
      oncleanup: () => {
        this.mainHandle = null;
      },
    });
  }


  joinToRoom(room: number) {
    const request = { request: "join", room, ptype: "publisher" };
    this.mainHandle?.send({
      message: request,
      success: () => {
        this.publishOwnFeed();
      },
      error: () => {},
    });
  }

  publishOwnFeed() {
    if (this.mainHandle?.webrtcStuff.started) {
      return;
    }

    this.mainHandle?.createOffer({
      media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },
      success: (jsep) => {
        const request = { request: "configure", audio: true, video: true };
        this.mainHandle?.send({ message: request, jsep });
      },
      error: () => {},
    });
  }

  initJanus(callback?: Function) {
    if (this.janus) {
      this.attach(callback);
      return;
    }

    Janus.init({
      debug: "all",
      dependencies: Janus.useDefaultDependencies({ adapter }),
      callback: () => {
        this.janus = new Janus({
          server: ["ws://localhost:8188/janus", "http://localhost:8088/janus"],
          success: () => {
            this.attach(callback);
          },
          error: () => {},
        });
      },
    });
  }
}

export const janusStore = new JanusStore();


/*

  getAvailableRooms(onSuccess: (rooms: { room: number; description: string }[]) => void) {
    const request = { request: "list" };
    this.mainHandle?.send({
      message: request,
      success: (result) => {
        if (result.videoroom === "success") {
          const newRooms = result.list.map((room) => ({
            description: room.description,
            room: room.room,
          }));
          onSuccess(newRooms);
        }
      },
      error: (error) => {
        console.error("Error fetching room list:", error);
      },
    });
  }

    createRoom(name: string, onSuccess?: (result: any) => void) {
    const request = { request: "create", description: name, publishers: 10 };
    this.mainHandle?.send({
      message: request,
      success: (result) => {
        roomStore.room = result.room;
        onSuccess?.(result);
      },
      error: (error) => {
        console.error("Error creating room:", error);
      },
    });
  }

*/
