import React from 'react';
import { Modal, InputNumber, Select, Checkbox, Input } from 'antd';
import styled from "styled-components";
const { TextArea } = Input;

const InputContainer = styled.div`
  display: flex;
  height: 30px;
  align-items: center;
  gap: 10px;
`;

const EditModal = ({
  modalTitle,
  open,
  handleOk,
  confirmLoading,
  handleCancel,
  modalRating,
  setModalRating,
  modalMediaType,
  modalIsAnime,
  modalIsSeasonalAnime,
  modalSeason,
  seasonChange,
  seOptions,
  filterOption,
  modalEpisode,
  episodeChange,
  epOptions,
  onSeasonalClick,
  modalReview,
  setModalReview
}) => (
  <Modal
    className="centered-modal-buttons"
    centered
    title={modalTitle}
    open={open}
    onOk={handleOk}
    confirmLoading={confirmLoading}
    onCancel={handleCancel}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", width: "100%", marginTop: "16px" }}>
        {/* rating */}
        <div style={{
          display: "flex",
          height: "30px",
          alignItems: "center",
          gap: "10px",
          width: "100%"
        }}>
          <p>Rating: </p>
          <InputNumber
            min={1}
            max={10}
            size="medium"
            value={modalRating}
            onChange={(value) => { setModalRating(value) }}
            style={{ marginLeft: "7px" }}
            className="modal-inputs"
          />
        </div>
      </div>
      {/* progress: episodes/seasons */}
      {modalMediaType !== "movie" ?
        <div className="progress-container">
          {modalIsAnime === false || modalIsSeasonalAnime === true ?
            <InputContainer >
              <p>Season:</p>
              <Select
                showSearch
                value={modalSeason}
                optionFilterProp="children"
                onChange={seasonChange}
                options={seOptions}
                filterOption={filterOption}
                style={{ marginLeft: "4px" }}
                className="modal-inputs"
              />
            </InputContainer> : null}
          <InputContainer className="episode-container">
            <p>Episode:</p>
            <Select
              showSearch
              value={modalEpisode}
              optionFilterProp="children"
              onChange={episodeChange}
              options={epOptions}
              filterOption={filterOption}
              className="modal-episode-input"
            />
          </InputContainer>

          {/* is seasonal anime toggle */}
          {modalIsAnime === true ?
            <InputContainer className="is_seasonal">
              <Checkbox checked={modalIsSeasonalAnime} onChange={(e) => onSeasonalClick(e.target.checked)}>Seasonal Anime?</Checkbox>
            </InputContainer> : null}

        </div> : null}
      {/* review */}
      <div className={
        modalMediaType !== "movie" && modalIsSeasonalAnime === true ? "review-s" :
          modalMediaType !== "movie" && modalIsSeasonalAnime === false ? "review-ns" :
            modalMediaType !== "movie" && modalIsAnime === false ? "review-tv" :
              "review-container"
      }>
        <p>Review:</p>
        <TextArea showCount rows={5} placeholder="" maxLength={1000} onChange={(e) => { setModalReview(e.target.value) }} value={modalReview} />
      </div>
    </div>
  </Modal>
);

export default EditModal;