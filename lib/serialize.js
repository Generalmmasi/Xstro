const { getContentType, extractMessageContent } = require('baileys');
const { parsedJid } = require('./utils');
const config = require('../config');
const commands = [];

function handler(cmdInfo, func) {
 cmdInfo.function = func;
 cmdInfo.pattern = new RegExp(`^(${config.PREFIX})\\s*(${cmdInfo.pattern})(?:\\s+(.*))?$`, 'i');
 if (typeof cmdInfo.alias === 'string') {
  cmdInfo.alias = [cmdInfo.alias];
 } else if (!Array.isArray(cmdInfo.alias)) {
  cmdInfo.alias = [];
 }
 cmdInfo.dontAddCommandList = cmdInfo.dontAddCommandList || false;
 cmdInfo.type = cmdInfo.type || 'misc';
 commands.push(cmdInfo);
 return cmdInfo;
}

function processViewOnceMessage(message) {
 let content = null;

 if (message.viewOnceMessageV2) {
  content = message.viewOnceMessageV2.message;
 } else if (message.viewOnceMessage) {
  content = message.viewOnceMessage.message;
 } else if (message.viewOnceMessageV2Extension) {
  content = message.viewOnceMessageV2Extension.message;
 }

 if (!content) return null;

 const type = Object.keys(content)[0];
 const mediaInfo = content[type] || {};

 return {
  type,
  mediaInfo,
  isViewOnce: true,
  messageType: type,
  caption: mediaInfo.caption || '',
  thumbnail: mediaInfo.thumbnailDirectPath || mediaInfo.thumbnail || null,
  mediaKey: mediaInfo.mediaKey,
  mimetype: mediaInfo.mimetype,
  size: mediaInfo.fileSize,
  height: mediaInfo.height,
  width: mediaInfo.width,
  seconds: mediaInfo.seconds,
  isAudio: type === 'audioMessage',
  isVideo: type === 'videoMessage',
  isImage: type === 'imageMessage',
  isDocument: type === 'documentMessage',
  fileName: mediaInfo.fileName,
  viewOnceId: mediaInfo.viewOnceId || null,
  mentions: mediaInfo.contextInfo?.mentionedJid || [],
  quotedMessage: mediaInfo.contextInfo?.quotedMessage || null,
 };
}

function processMediaMessage(message, type) {
 if (!message || !type) return null;

 const mediaInfo = message[type];
 return {
  type,
  isMedia: true,
  caption: mediaInfo?.caption || '',
  thumbnail: mediaInfo?.thumbnailDirectPath || mediaInfo?.thumbnail || null,
  mediaKey: mediaInfo?.mediaKey,
  mimetype: mediaInfo?.mimetype,
  size: mediaInfo?.fileSize,
  height: mediaInfo?.height,
  width: mediaInfo?.width,
  seconds: mediaInfo?.seconds,
  fileName: mediaInfo?.fileName,
  gifPlayback: mediaInfo?.gifPlayback || false,
  gifAttribution: mediaInfo?.gifAttribution || null,
  isAnimated: mediaInfo?.isAnimated || false,
  ptt: mediaInfo?.ptt || false,
  isViewOnce: false,
  mentions: mediaInfo?.contextInfo?.mentionedJid || [],
  quotedMessage: mediaInfo?.contextInfo?.quotedMessage || null,
 };
}

async function serialize(msg, conn) {
 conn.logger = { info() {}, error() {}, warn() {} };

 if (msg.key) {
  msg.id = msg.key.id || null;
  msg.isSelf = msg.key.fromMe || false;
  msg.from = msg.key.remoteJid || null;
  msg.isGroup = msg.from ? msg.from.endsWith('@g.us') : false;
  msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
  msg.senderJid = parsedJid(msg.sender)[0];
  msg.timestamp = msg.key.timestamp || Date.now();
  msg.pushName = msg.pushName || '';
  msg.messageTimestamp = msg.messageTimestamp || Date.now();
  msg.status = msg.status || 0;

  try {
   if (msg.isGroup) {
    const groupMetadata = await conn.groupMetadata(msg.from);
    msg.isAdmin = groupMetadata.participants.find((p) => p.id === msg.sender)?.admin !== null;
    msg.isBotAdmin = groupMetadata.participants.find((p) => p.id === conn.user.id)?.admin !== null;
    msg.groupName = groupMetadata.subject;
    msg.groupDesc = groupMetadata.desc;
    msg.groupMembers = groupMetadata.participants;
    msg.groupAdmins = groupMetadata.participants.filter((p) => p.admin !== null).map((p) => p.id);
   }
   try {
    msg.sudo = config.SUDO.split(',').includes(msg.senderJid.split('@')[0]) || msg.key.fromMe;
   } catch {
    msg.sudo = false;
   }
  } catch {
   msg.isAdmin = false;
   msg.isBotAdmin = false;
   msg.sudo = false;
  }
 }

 if (msg.message) {
  const messageContent = extractMessageContent(msg.message);
  msg.type = getContentType(messageContent) || null;

  msg.viewOnce = null;
  if (messageContent.viewOnceMessage || messageContent.viewOnceMessageV2 || messageContent.viewOnceMessageV2Extension) {
   msg.viewOnce = processViewOnceMessage(messageContent);
   msg.isViewOnce = true;
   msg.viewOnceMediaType = msg.viewOnce?.messageType;
   msg.body = msg.viewOnce?.caption || '';
  }

  try {
   msg.mentions = [...(messageContent[msg.type]?.contextInfo?.mentionedJid || []), ...(messageContent[msg.type]?.contextInfo?.participant ? [messageContent[msg.type].contextInfo.participant] : [])];
   msg.mentionedJids = [...new Set(msg.mentions)];
  } catch {
   msg.mentions = [];
   msg.mentionedJids = [];
  }

  try {
   const mediaTypes = {
    image: 'imageMessage',
    video: 'videoMessage',
    audio: 'audioMessage',
    sticker: 'stickerMessage',
    document: 'documentMessage',
   };

   msg.isMedia = Object.values(mediaTypes).includes(msg.type);
   if (msg.isMedia) {
    msg.media = processMediaMessage(messageContent, msg.type);

    msg.isImage = msg.type === mediaTypes.image;
    msg.isVideo = msg.type === mediaTypes.video;
    msg.isAudio = msg.type === mediaTypes.audio;
    msg.isSticker = msg.type === mediaTypes.sticker;
    msg.isDocument = msg.type === mediaTypes.document;

    msg.downloadMedia = async () => {
     try {
      const buffer = await conn.downloadMediaMessage(msg);
      return buffer;
     } catch (error) {
      console.error('Error downloading media:', error);
      return null;
     }
    };
   }
  } catch (error) {
   console.error('Error in media processing:', error);
   msg.isMedia = false;
   msg.media = null;
  }

  try {
   const quoted = messageContent[msg.type]?.contextInfo;
   if (quoted && quoted.quotedMessage) {
    const quotedContent = extractMessageContent(quoted.quotedMessage);
    const quotedType = getContentType(quotedContent);

    msg.quoted = {
     type: quotedType,
     stanzaId: quoted.stanzaId,
     sender: quoted.participant || quoted.remoteJid,
     message: quotedContent,
     isSelf: false,
     text: '',
     jid: parsedJid(quoted.participant || quoted.remoteJid)[0],
    };

    if (quoted.quotedMessage.ephemeralMessage) {
     const ephemeralMessage = quoted.quotedMessage.ephemeralMessage.message;
     msg.quoted.type = 'ephemeral';
     msg.quoted.message = ephemeralMessage;
     msg.quoted.disappearingTime = quoted.quotedMessage.ephemeralMessage.duration;
    } else if (quotedContent.viewOnceMessage || quotedContent.viewOnceMessageV2 || quotedContent.viewOnceMessageV2Extension) {
     msg.quoted.viewOnce = processViewOnceMessage(quotedContent);
     msg.quoted.type = 'view_once';
     msg.quoted.message = msg.quoted.viewOnce;
    }

    msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
    msg.quoted.mtype = Object.keys(msg.quoted.message)[0];
    msg.quoted.isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(msg.quoted.mtype);

    msg.quoted.text = msg.quoted.message[msg.quoted.mtype]?.text || msg.quoted.message[msg.quoted.mtype]?.caption || msg.quoted.message[msg.quoted.mtype]?.description || (msg.quoted.mtype === 'templateButtonReplyMessage' && msg.quoted.message[msg.quoted.mtype].hydratedTemplate?.hydratedContentText) || msg.quoted.message[msg.quoted.mtype] || '';

    msg.quoted.key = {
     id: msg.quoted.stanzaId,
     fromMe: msg.quoted.isSelf,
     remoteJid: msg.from,
     participant: msg.quoted.sender,
     timestamp: quoted.timestamp || Date.now(),
    };

    if (msg.quoted.isMedia) {
     msg.quoted.media = processMediaMessage(msg.quoted.message, msg.quoted.mtype);
     msg.quoted.downloadMedia = async () => {
      try {
       const buffer = await conn.downloadMediaMessage(msg.quoted);
       return buffer;
      } catch (error) {
       console.error('Error downloading quoted media:', error);
       return null;
      }
     };
    }
   }
  } catch (error) {
   console.error('Error in processing quoted message:', error);
   msg.quoted = null;
  }
  try {
   if (!msg.isViewOnce) {
    msg.body = messageContent.conversation || messageContent[msg.type]?.text || messageContent[msg.type]?.caption || (msg.type === 'listResponseMessage' && messageContent[msg.type].singleSelectReply.selectedRowId) || (msg.type === 'buttonsResponseMessage' && messageContent[msg.type].selectedButtonId) || (msg.type === 'templateButtonReplyMessage' && messageContent[msg.type].selectedId) || (msg.type === 'reactionMessage' && messageContent[msg.type].text) || '';
   }
   msg.isReaction = msg.type === 'reactionMessage';
   msg.isEphemeral = messageContent?.ephemeralMessage != null;
   msg.isForwarded = !!messageContent[msg.type]?.contextInfo?.isForwarded;
   msg.forwardingScore = messageContent[msg.type]?.contextInfo?.forwardingScore || 0;

   if (msg.isEphemeral) {
    msg.disappearingTime = messageContent.ephemeralMessage.duration;
   }

   if (msg.type === 'buttonsResponseMessage' || msg.type === 'templateButtonReplyMessage') {
    msg.selectedButton = {
     id: messageContent[msg.type].selectedId || messageContent[msg.type].selectedButtonId,
     text: messageContent[msg.type].selectedDisplayText,
    };
   }
   if (msg.type === 'listResponseMessage') {
    msg.selectedList = {
     id: messageContent[msg.type].singleSelectReply.selectedRowId,
     title: messageContent[msg.type].title,
     description: messageContent[msg.type].description,
    };
   }
  } catch (error) {
   console.error('Error in message body processing:', error);
   msg.body = '';
  }

  conn.client = msg;
 }
 return msg;
}

module.exports = { serialize, handler, commands };
