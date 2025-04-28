import { ReactNode } from "react";
import CloseIcon from "../../assets/x-solid.svg?react";
import "../styles/modal.scss";

interface ModalProps {
	children: ReactNode;
	closable: Boolean;
	onClose: () => void;
}

export const Modal = ({ children, closable, onClose }: ModalProps) => {
	const handleClose = () => {
		onClose();
	};

	return (
		<div className="modal">
			<div className="modal-content">
				{closable ? (
					<div className="modal-close" onClick={() => handleClose()}>
						<CloseIcon />
					</div>
				) : null}
				{children}
			</div>
		</div>
	);
};
