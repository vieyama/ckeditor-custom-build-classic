import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FileDialogButtonView from "@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview";
import axios from "axios";
import imageIcon from "./video-camera.svg";
import swal from "sweetalert";
import _ from "lodash";

const _UPLOAD_FILE_LIMIT = 52428800;

export default class InsertVideo extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("insertVideo", (locale) => {
      const view = new FileDialogButtonView(locale);

      view.set({
        acceptedType: "video/*",
        allowMultipleFiles: false,
      });

      view.buttonView.set({
        label: "Insert Video",
        icon: imageIcon,
        tooltip: true,
      });

      const uniqID = (
        Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      ).toUpperCase();

      view.on("done", async (evt, files) => {
        var file = files[0];
        const size = file.size;

        if (size > _UPLOAD_FILE_LIMIT) {
          //50mb이상 파일일 때 notification 보냄
          swal("Info", "File tidak boleh melebihi 50 MB!", "error");
          return;
        }

        swal("Mengunggah video ...", {
          buttons: false,
          closeOnClickOutside: false,
        });

        const data = new FormData();
        data.append("bucketName", "media");
        data.append("storagePath", "question-file/video");
        data.append("file", file);
        data.append("fileName", `question-video-${uniqID}`);

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
            const video = `<figure class="video"><video controls="controls" alt="" src="${result.data.urlPath}">&nbsp;</video></figure><p>&nbsp;</p>`;
            const viewFragment = editor.data.processor.toView(video);
            const modelFragment = editor.data.toModel(viewFragment);
            editor.model.insertContent(
              modelFragment,
              editor.model.document.selection
            );
            swal.close();
          })
          .catch(() => {
            swal("Info", "Terjadi kesalahan, silahkan coba kembali!", "error");
            swal.close();
            return;
          });
      });
      return view;
    });
  }
}
