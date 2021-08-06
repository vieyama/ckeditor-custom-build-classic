import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FileDialogButtonView from "@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview";
import imageIcon from "./volume.svg";

async function audioToBase64(audioFile) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(audioFile);
  });
}
export default class InsertAudio extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("insertAudio", (locale) => {
      const view = new FileDialogButtonView(locale);

      view.set({
        acceptedType: "audio/*",
        allowMultipleFiles: false,
      });

      view.buttonView.set({
        label: "Insert Audio",
        icon: imageIcon,
        tooltip: true,
      });

      const uniqID = (
        Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      ).toUpperCase();

      view.on("done", async (evt, files) => {
        const file = files[0];
        const url = URL.createObjectURL(file);

        await audioToBase64(file).then((res) => {
          const audio = `<figure class="audio">
              <audio
                controls="controls"
                alt=""
                src="${res}"
              >
                &nbsp;
              </audio>
            </figure>`;
          const viewFragment = editor.data.processor.toView(audio);
          const modelFragment = editor.data.toModel(viewFragment);
          editor.model.insertContent(
            modelFragment,
            editor.model.document.selection
          );
        });
      });
      return view;
    });
  }
}
