import _ from "lodash";

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FileDialogButtonView from "@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview";
import FileRepository from "@ckeditor/ckeditor5-upload/src/filerepository";
import Command from "@ckeditor/ckeditor5-core/src/command";
import axios from "axios";
import imageIcon from "./volume.svg";
import swal from "sweetalert";

const _UPLOAD_FILE_LIMIT = 20971520;

const uniqID = (
  Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
).toUpperCase();

class FileUploadCommand extends Command {
  /**
   * Executes the command.
   *
   * @fires execute
   * @param {Object} options Options for the executed command.
   * @param {File|Array.<File>} options.file The image file or an array of image files to upload.
   */
  //fileUpload command를 받으면 execute함수가 실행 됨.
  execute(options) {
    const editor = this.editor;
    const model = editor.model;

    //File Repository 가져옮
    const fileRepository = editor.plugins.get(FileRepository);

    model.change((writer) => {
      const filesToUpload = Array.isArray(options.file)
        ? options.file
        : [options.file];

      for (const file of filesToUpload) {
        if (file.size > _UPLOAD_FILE_LIMIT) {
          //50mb이상 파일일 때 notification 보냄
          swal("Info", "File tidak boleh melebihi 20 MB!", "error");
          return;
        }
        uploadFile(writer, model, fileRepository, file);
      }
    });
  }
}

// Handles uploading single file.
//
// @param {module:engine/model/writer~writer} writer
// @param {module:engine/model/model~Model} model
// @param {File} file
function uploadFile(writer, model, fileRepository, file) {
  //파일 별 loader instance를 생성 함.
  const loader = fileRepository.createLoader(file);

  if (!loader) {
    return;
  }

  //loader가 file를 disk에서 read() 후 upload()로 server에 전송 함.
  loader
    .read()
    .then(() => loader.upload())
    .then(async () => {
      swal("Mengunggah audio ...", {
        buttons: false,
        closeOnClickOutside: false,
      });
      //editor에 <a> tag로 되어 있는 file element를 삽입 함.
      // model.insertContent(fileElement, editor.model.document.selection);
      const data = new FormData();
      data.append("bucketName", "media");
      data.append("storagePath", "question-file/audio");
      data.append("file", file);
      data.append("fileName", `question-audio-${uniqID}`);

      await axios
        .post(
          "https://dev-storageclient-edoo.mocogawe.com/uploadobject",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((result) => {
          console.log(result);

          const audio = `<figure class="audio"><audio controls="controls" alt="" 
          src="${result.data.urlPath}"
          >&nbsp;</audio></figure><p>&nbsp;</p>`;

          const viewFragment = editor.data.processor.toView(audio);
          const modelFragment = editor.data.toModel(viewFragment);
          editor.model.insertContent(
            modelFragment,
            editor.model.document.selection
          );
          swal.close();
        })
        .catch((err) => {
          console.log(err);
          if (err) {
            swal("Info", "Terjadi kesalahan, silahkan coba kembali!", "error");
            swal.close();
            return;
          }
        });
    });
}

class Uploader extends Plugin {
  init() {
    const editor = this.editor;
    //fileUpload command에 위에서 구현한 FileUploadCommand를 연동 시킴
    editor.commands.add("fileUpload", new FileUploadCommand(editor));

    editor.ui.componentFactory.add("uploadAudio", (locale) => {
      const view = new FileDialogButtonView(locale);

      view.buttonView.set({
        label: "Insert Audio",
        icon: imageIcon,
        tooltip: true,
      });

      view.set({
        acceptedType: "audio/*",
        allowMultipleFiles: false,
      });

      view.on("done", (evt, files) => {
        const [filesToUpload] = _.partition(files, (file) => file);

        if (filesToUpload.length) {
          editor.execute("fileUpload", { file: filesToUpload });
        }
      });

      return view;
    });
  }
}

export default Uploader;
