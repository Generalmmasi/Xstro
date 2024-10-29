const { downloadContentFromMessage } = require('baileys');
const { getMode, isSudo, isBan } = require('./config');
const { getBuffer, imageToWebp, writeExifVid, videoToWebp, writeExifImg, toAudio, decodeJid } = require('./utils');
const fs = require('fs/promises');
const config = require('../config');
const path = require('path');
const FileType = require('file-type');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

class Message {
 constructor(client, data) {
  this.client = client;
  this.temp = path.join(__dirname, '..', 'temp');
  this._patch(data);
  this.ready = this._asyncPatch(data);
 }

 _patch(data) {
  Object.assign(this, {
   data,
   key: data.key,
   id: data.key.id,
   jid: data.key.remoteJid,
   participant: decodeJid(data.sender),
   sender: data.pushName,
   bot: data.key.id.startsWith('BAE5'),
   user: decodeJid(this.client.user.id),
   fromMe: data.key.fromMe,
   isGroup: data.isGroup,
   timestamp: data.messageTimestamp?.low || data.messageTimestamp || Date.now(),
   text: data.body || '',
   prefix: config.PREFIX,
   sudo: false,
  });
  try {
   this.sudo = config.SUDO.split(',').includes(this.participant?.split('@')[0]);
  } catch {
   this.sudo = false;
  }
  this.owner = this.fromMe || this.sudo;

  if (data.message) {
   const type = Object.keys(data.message)[0];
   const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];

   Object.assign(this, {
    type: type.replace('Message', '').toLowerCase(),
    message: data.message[type],
    body: data.body || '',
    mention: data.message[type]?.contextInfo?.mentionedJid || [],
    mediaType: mediaTypes.includes(this.type) ? this.type : 'text',
    mediaUrl: data.message[type]?.url,
    fileSize: data.message[type]?.fileLength,
    caption: data.message[type]?.caption,
    mimetype: data.message[type]?.mimetype,
   });

   if (data.quoted) {
    this.quoted = data.quoted;
    const qMessage = data.quoted.message;
    const qMediaType = Object.keys(qMessage).find((key) => mediaTypes.includes(key.replace('Message', '').toLowerCase())) || 'text';

    this.reply_message = {
     key: data.quoted.key,
     sender: data.quoted.key.participant,
     contextInfo: qMessage?.extendedTextMessage?.contextInfo || qMessage?.contextInfo || {},
     caption: qMessage?.[qMediaType + 'Message']?.caption,
     mediaType: qMediaType.replace('Message', '').toLowerCase(),
     bot: data.quoted.key.id.includes('BAE5'),
     ...mediaTypes.reduce(
      (acc, type) => ({
       ...acc,
       [type]: qMediaType.toLowerCase().includes(type),
       isText: !!qMessage?.conversation || !!qMessage?.extendedTextMessage?.text,
      }),
      {}
     ),
    };
   }
  }
 }
 async _asyncPatch() {
  const checks = [];
  if (this.participant) {
   checks.push(isSudo(this.participant), isBan(this.participant));
  } else {
   this.sudo = false;
   this.isban = false;
  }
  if (this.reply_message?.sender) {
   checks.push(isSudo(this.reply_message.sender), isBan(this.reply_message.sender));
  } else {
   if (this.reply_message) {
    this.reply_message.sudo = false;
    this.reply_message.isban = false;
   }
  }
  const results = await Promise.all(checks);
  if (this.participant) {
   this.sudo ||= results[0];
   this.isban = results[1];
  }
  if (this.reply_message?.sender) {
   this.reply_message.sudo = results[2];
   this.reply_message.isban = results[3];
  }
  this.owner = this.fromMe || this.sudo;
  this.mode = await getMode(this.owner, this.participant);
 }

 async reply(text, options = {}) {
  let messageContent = { text: String(text) };
  if (options.mentions) messageContent.mentions = options.mentions;
  const message = await this.client.sendMessage(this.jid, messageContent, { quoted: this.data, ...options });
  return new Message(this.client, message);
 }

 async react(emoji) {
  return this.client.sendMessage(this.jid, { react: { text: emoji, key: this.key } });
 }

 async edit(text, opt = {}) {
  return this.client.sendMessage(this.jid, { text, edit: this.key }, opt);
 }

 async send(content, options = {}) {
  const jid = options.jid || this.jid;
  const quoted = options.quoted || this.data;

  const getContentBuffer = async (content) => {
   if (Buffer.isBuffer(content)) return content;
   if (typeof content === 'string' && content.startsWith('http')) {
    return await getBuffer(content);
   }
   return Buffer.from(content);
  };

  const ensureBuffer = async (input) => {
   const buffer = await getContentBuffer(input);
   if (!Buffer.isBuffer(buffer)) {
    throw new Error('Failed to convert content to a valid buffer.');
   }
   return buffer;
  };

  const detectMimeType = async (buffer) => {
   if (typeof buffer === 'string') {
    return 'text/plain';
   }
   try {
    const fileType = await FileType.fromBuffer(buffer);
    return fileType ? fileType.mime : 'application/octet-stream';
   } catch {
    return 'application/octet-stream';
   }
  };

  const sendText = (text, options) => {
   return this.client.sendMessage(jid, { text, ...options }, { quoted: quoted });
  };

  const sendImage = (buffer, options) => {
   return this.client.sendMessage(jid, { image: buffer, ...options }, { quoted: quoted });
  };

  const sendVideo = (buffer, options) => {
   return this.client.sendMessage(jid, { video: buffer, ...options }, { quoted: quoted });
  };

  const sendAudio = (buffer, options) => {
   return this.client.sendMessage(jid, { audio: buffer, mimetype: 'audio/mp4', ...options }, { quoted: quoted });
  };

  const sendDocument = (buffer, options) => {
   return this.client.sendMessage(
    jid,
    {
     document: buffer,
     mimetype: options.mimetype || 'application/octet-stream',
     fileName: options.filename || 'file',
     ...options,
    },
    { quoted: quoted }
   );
  };

  const sendSticker = async (buffer, options) => {
   let stickerBuffer = buffer;
   const fileType = await FileType.fromBuffer(buffer);
   const isWebp = fileType?.mime === 'image/webp';

   if (isWebp) {
    stickerBuffer = await writeExifImg(buffer, options);
   } else {
    stickerBuffer = await imageToWebp(buffer);
    stickerBuffer = await writeExifImg(stickerBuffer, options);
   }
   if (typeof stickerBuffer === 'string') stickerBuffer = await fs.readFile(stickerBuffer);
   return this.client.sendMessage(jid, { sticker: stickerBuffer, ...options }, { quoted: quoted });
  };

  const sendVideoAsAudio = async (buffer, options) => {
   const audioBuffer = await toAudio(buffer);
   return sendAudio(audioBuffer, options);
  };

  const sendVideoAsSticker = async (buffer, options = {}) => {
   let stickerBuffer;
   const fileType = await FileType.fromBuffer(buffer);
   const isWebp = fileType?.mime === 'image/webp';

   if (isWebp) {
    stickerBuffer = await writeExifImg(buffer, options);
   } else {
    stickerBuffer = await videoToWebp(buffer);
    stickerBuffer = await writeExifVid(stickerBuffer, options);
   }
   if (typeof stickerBuffer === 'string') stickerBuffer = await fs.readFile(stickerBuffer);
   return this.client.sendMessage(jid, { sticker: stickerBuffer, ...options });
  };

  try {
   let buffer;
   let mimeType;

   if (typeof content === 'string' && !content.startsWith('http')) {
    buffer = content;
    mimeType = 'text/plain';
   } else {
    buffer = await ensureBuffer(content);
    mimeType = await detectMimeType(buffer);
   }

   const contentType = options.type || mimeType.split('/')[0];

   const sendOptions = {
    caption: options.caption,
    contextInfo: options.contextInfo,
    ...options,
   };

   switch (contentType) {
    case 'text':
     return sendText(typeof buffer === 'string' ? buffer : buffer.toString(), sendOptions);
    case 'image':
     return options.asSticker ? sendSticker(buffer, sendOptions) : sendImage(buffer, sendOptions);
    case 'video':
     if (options.asSticker || contentType === 'sticker') {
      return sendVideoAsSticker(buffer, sendOptions);
     }
     if (options.asAudio) {
      return sendVideoAsAudio(buffer, sendOptions);
     }
     return sendVideo(buffer, sendOptions);
    case 'audio':
     return sendAudio(buffer, sendOptions);
    case 'document':
     return sendDocument(buffer, sendOptions);
    case 'sticker':
     return sendSticker(buffer, sendOptions);
    default:
     return sendDocument(buffer, { ...sendOptions, mimetype: mimeType });
   }
  } catch (error) {
   console.error('Error sending message:', error);
   throw new Error('Invalid Media: ' + error.message);
  }
 }

 async download() {
  const msg = this.quoted.message;
  const mimeMap = {
   imageMessage: 'image',
   videoMessage: 'video',
   stickerMessage: 'sticker',
   documentMessage: 'document',
   audioMessage: 'audio',
  };

  const type = Object.keys(mimeMap).find((key) => msg[key]);
  if (!type) return null;

  const mediaType = mimeMap[type];
  const stream = await downloadContentFromMessage(msg[type], mediaType);

  const buffer = Buffer.concat(
   await (async () => {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return chunks;
   })()
  );

  const mimeType = msg[type].mimetype;
  const extensions = {
   'image/jpeg': 'jpg',
   'image/png': 'png',
   'video/mp4': 'mp4',
   'audio/ogg; codecs=opus': 'ogg',
   'application/pdf': 'pdf',
   'image/webp': 'webp',
  };

  const fileExtension = extensions[mimeType] || 'bin';
  const fileName = `${mediaType}_${Date.now()}.${fileExtension}`;
  const filePath = path.join(process.cwd(), this.temp, fileName);
  await fs.mkdir(path.join(process.cwd(), this.temp), { recursive: true });
  await fs.writeFile(filePath, buffer);

  return { buffer, filePath };
 }
}

module.exports = Message;
