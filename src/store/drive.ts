import { computed } from 'vue';
import { defineStore } from 'pinia';

export interface Drive {
  key: string;
  name: string;
  url: string;
  deletable: boolean;
}

interface DriveState {
  drives: Drive[];
  selected?: string[];
}

export const useDriveStore = defineStore('drive', {
  // 持久化
  persist: true,

  state: (): DriveState => ({
    drives: [],
    selected: [],
  }),

  // 获取器
  getters: {
    getDrives: (state: DriveState) => {
      return state.drives;
    },
    getSelectedKeys: (state: DriveState) => {
      return state.selected || [];
    },
    getSelectedDrives: (state: DriveState) => {
      return computed(() => {
        return state.selected?.map((key) => state.drives.find((drive) => drive.key === key)) || [];
      });
    },
  },

  // 动作
  actions: {
    addDrive(drive: Drive) {
      this.drives.push(drive);
    },
    deleteDrive(drive: Drive) {
      this.drives = this.drives.filter((item) => item.key !== drive.key);
      this.selected = this.selected?.filter((item) => item !== drive.key);
    },
    setSelected(selected: string[]) {
      this.selected = selected.filter((item) => this.drives.some((drive) => drive.key === item));
    },
  },
});
